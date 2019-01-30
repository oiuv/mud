// closed.c

// #pragma optimize
// #pragma save_binary

#define CLOSED_CMD              "/cmds/skill/closed"
#define BREAKUP_CMD             "/cmds/skill/breakup"
#define SCHEME_CMD              "/cmds/usr/scheme"

inherit F_SAVE;

mapping closed_users = 0;

void load_all_users();

void create()
{
        seteuid(getuid());
        restore();
	set_heart_beat(3);
}

void remove()
{
        save();
}

void mud_shutdown()
{
        save();
}

string query_save_file()
{
        return DATA_DIR "closed";
}

mapping query_closed_users()
{
        return closed_users;
}

void user_closed(object user)
{
        user->set_short_desc("盘膝而坐，正在瞑目闭关修炼。");
        user->set_temp("last_closing", time());
        if (! closed_users)
                closed_users = ([ ]);
        if (undefinedp(closed_users[user->query("id")]))
                closed_users += ([ user->query("id") : user->query("startroom") ]);
        else
                closed_users[user->query("id")] = user->query("startroom");
        save();
	user->save();
	set_heart_beat(10 + random(10));
}

void user_opened(object user)
{
        user->delete("doing");
        user->set_short_desc(0);
        user->delete_temp("last_closing");
        if (mapp(closed_users))
        {
                map_delete(closed_users, user->query("id"));
                if (! sizeof(closed_users))
		{
                        closed_users = 0;
			set_heart_beat(0);
		}
        }

        save();
        user->delete("startroom");
	user->save();
}

void heart_beat()
{
        if (! VERSION_D->is_version_ok())
                return;

	load_all_users();
}

void continue_doing(object user_ob)
{
        int res;

        switch (user_ob->query("doing"))
        {
        case "closed":
                res = CLOSED_CMD->continue_closing(user_ob);
                break;

        case "breakup":
                res = BREAKUP_CMD->continue_breaking(user_ob);
                break;

        case "scheme":
                res = SCHEME_CMD->continue_scheme(user_ob);
                break;

        default:
                // Aha? The user isn't closing now
                res = 0;
                return;
        }

        if (! res)
                user_opened(user_ob);
}

void load_all_users()
{
        string u;
        object login_ob;
        object user_ob;

        if (! mapp(closed_users))
                return;

	set_heart_beat(10 + random(10));
        foreach (u in keys(closed_users))
        {
                if (! objectp(user_ob = LOGIN_D->find_body(u)))
                {
                        // load the user
                        login_ob = new(LOGIN_OB);
                        login_ob->set("id", u);
                        if (! login_ob->restore())
                        {
                                destruct(login_ob);
				map_delete(closed_users, u);
                                log_file("log", sprintf("closed：没有玩家(%s)。\n", u));
                                continue;
                        }
        
                        user_ob = LOGIN_D->make_body(login_ob);
                        if (! user_ob)
                        {
                                destruct(login_ob);
				map_delete(closed_users, u);
                                log_file("log", sprintf("closed：无法生成玩家(%s)。\n", u));
                                continue;
                        }
        
                        if (! user_ob->restore())
                        {
                                destruct(login_ob);
                                destruct(user_ob);
				map_delete(closed_users, u);
                                log_file("log", sprintf("closed：无法读取玩家(%s)的档案。\n", u));
                                continue;
                        }

                        // Setup the user and move he to the closing room
			catch(LOGIN_D->enter_world(login_ob, user_ob));
			if (! stringp(user_ob->query("doing")) || ! environment(user_ob))
			{
				destruct(login_ob);
				destruct(user_ob);
				map_delete(closed_users, u);
			}
			continue;
                }

                if (query_heart_beat(user_ob))
                        // the user is doing now
                        continue;

                continue_doing(user_ob);
 
                // continue to examine next user
        }
}
