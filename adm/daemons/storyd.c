// storyd.c

#include <ansi.h>

inherit F_DBASE;

// 每 20 天刷新故事
#define REFRESH_TIME    20 * 86400

STATIC_VAR_TAG string *story_name;

STATIC_VAR_TAG object  running_story;
STATIC_VAR_TAG mapping history;
STATIC_VAR_TAG int step;
int    filter_listener(object ob);

private void init_story();
private void ready_to_start();
private void go_on_process(object ob);

void create()
{
        seteuid(ROOT_UID);
        set("channel_id", "故事精灵");
        CHANNEL_D->do_channel( this_object(), "sys", "故事系统已经启动。");

        init_story();

        history = allocate_mapping(sizeof(story_name));
        ready_to_start();
}

private void init_story()
{
        CHANNEL_D->do_channel( this_object(), "sys", "故事系统更新所有故事。");
        story_name = get_dir(STORY_DIR + "*.c");
        story_name = map_array(story_name, (: $1[0..<3] :));
        set_temp("last_update", time());
}

private void ready_to_start()
{
        if (time() - query_temp("last_update") > REFRESH_TIME)
                init_story();

        remove_call_out("start_story");
        remove_call_out("process_story");
        call_out("start_story", 1800 + random(300));
      // call_out("start_story", 180 + random(30));//测试用
        
}

private void go_on_process(object ob)
{
        remove_call_out("start_story");
        remove_call_out("process_story");
        call_out("process_story", 1, ob);
}

int clean_up()
{
        return 1;
}

object query_running_story()
{
        return running_story;
}

varargs void start_story(string sname)
{
        string *all_story;
        string name;
        object ob;

        ready_to_start();

        if (VERSION_D->is_boot_synchronizing())
                // 正在启动中同步版本？那么不启动任何故事
                return;

        CHANNEL_D->do_channel(this_object(), "sys", "故事系统开始选择故事。");

        if (sname)
                all_story = explode(sname, ",");
        else
                all_story = filter_array(story_name, (: $1 == "challenge" ||
                                                        time() - (int)history[$1] > 18000 :));
        while (sizeof(all_story))
        {
                name = all_story[random(sizeof(all_story))];
                if (undefinedp(history[name]))
                        history += ([ name : 0 ]);
                else
                        history[name] = (int)time();

                CHANNEL_D->do_channel(this_object(), "sys",
                                      "故事系统选择了故事(" + name + ")。");
 
                all_story -= ({ name });
                name = STORY_DIR + name;
                if (ob = find_object(name))
                        destruct(ob);
        
                catch(ob = load_object(name));
                running_story = ob;
        
                if (objectp(ob))
                {
                        step = 0;
                        go_on_process(ob);
                        break;
                }
        }
}

void remove_story(string story)
{
        story_name -= ({ story });
}

string *query_all_story()
{
        return story_name;
}

void process_story(object ob)
{
        mixed line;
        object *listeners;
        string prompt;

        go_on_process(ob);

        if (! objectp(ob))
        {
                ready_to_start();
                return;
        }

        line = ob->query_story_message(step);
        step++;

        prompt = ob->prompt();
        if (! prompt) prompt = HIG "【故事传闻】" NOR;
        if (functionp(line)) catch(line = evaluate(line));
        if (stringp(line))
        {
                listeners = filter_array(users(), (: filter_listener :));
                message( "story",  prompt + WHT + line + "\n" NOR, listeners );
        }

        if (intp(line) && ! line)
        {
                ready_to_start();
                destruct(ob);
        }
}

int filter_listener(object ob)
{
        if (ob->query("env/no_story")) return 0;
        return 1;
}

void give_gift(string gift, int amount, string msg)
{
        object ob, pob;
        object env;
        mapping ips;
        string ip, *ks;

        ips = ([ ]);
        foreach (pob in all_interactive())
        {
                if (wizardp(pob) || ! pob->query("born") ||
                    ! living(pob) || ! environment(pob) ||
                    pob->is_ghost() ||
                    environment(pob)->is_chat_room())
                        continue;

                ip = query_ip_number(pob);
                if (undefinedp(ips[ip])) ips[ip] = ({ pob }); else ips[ip] += ({ pob });
        }

        if (sizeof(ips) >= 1)
        {
                // 需要三个以上的IP登录才给与奖品

                // 随即抽一个IP
                ks = keys(ips);
                ip = ks[random(sizeof(ks))];

                // 在该IP地址上随即抽取一个玩家
                pob = ips[ip][random(sizeof(ips[ip]))];

                env = environment(pob);
                while (env && env->is_character())
                        env = environment(env);

                if (! objectp(env)) return;

                tell_room(env, msg);
                while (amount-- > 0)
                {
                        ob = new(gift);
                        ob->move(env);
                }
                CHANNEL_D->do_channel( this_object(),
                        "sys", sprintf(NOR WHT "赠品%s" NOR WHT "掉到了"
                                HIC "%s" NOR WHT "(%O" NOR WHT ")。" NOR,
                                ob->name(), env->short(), env));
        }
}
