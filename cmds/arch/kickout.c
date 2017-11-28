// kickout.c

#include <ansi.h>
#include <command.h>

inherit F_CLEAN_UP;

void kickout_player(object me, object ob);

int main(object me, string arg)
{
        object ob;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        if (! arg)
                return notify_fail("你要踢谁？\n");

        ob = LOGIN_D->find_body(arg);
	ob = MESSAGE_D->find_user(arg);
        if (! ob || ! me->visible(ob))
                return notify_fail("咦... 有这个人吗?\n");

        if (! userp(ob) && base_name(ob) != USER_OB &&
	    ! ob->is_chatter())
                return notify_fail("你只能把玩家踢出去。\n");

        if (ob == me)
                return notify_fail("你的大脑是不是进了水？\n");

        if (wiz_level(me) < wiz_level(ob))
                return notify_fail("“当啷”的一声，你踢到铁板。\n");

	this_object()->kickout_player(me, ob);
        return 1;
}

void kickout_player(object me, object ob)
{
	object link_ob;

	if (previous_object() &&
	    ! is_root(previous_object()) &&
	    ! sscanf(base_name(previous_object()), "/clone/special/%*s"))
		return;

        log_file("static/kickout_player", sprintf("%s %-9s kickout %s\n",
                        log_time(), geteuid(me), geteuid(ob)));

        tell_object(me, "你把" + ob->query("name") + "踢了出去！\n");
        CHANNEL_D->do_channel(this_object(), "rumor",
                	      sprintf("%s被%s踢出了泥潭。",
			      ob->name(), me->name()));
        seteuid(ROOT_UID);
	if (ob->is_chatter())
	{
		MESSAGE_D->user_logout(ob, "你被" + me->name(1) +
					   "踢了出去。\n");
		return;
	}

	if (objectp(link_ob = ob->query_temp("link_ob")))
	{
		catch(link_ob->save());
		destruct(link_ob);
	}
        catch(ob->save());
        destruct(ob);
        seteuid(getuid());
}

int help(object me)
{
write(@HELP
指令格式 : kickout <某人>

HELP );
    	return 1;
}
