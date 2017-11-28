// go.c

#include <ansi.h>
#include <command.h>
#include <net/messaged.h>

inherit F_CLEAN_UP;
void send_exits(object me, object env);

int main(object me, mapping info)
{
        string arg;
        object env;
        object ob;
        mapping exits;

        if (! objectp(env = environment(me)) || env == find_object(VOID_OB))
        {
                MESSAGE_D->tell_user(me, FUN_NOTICE, "你现在处在缥缈的"
                                     "虚空中，四周一片茫茫，没什么地方好去的。\n");
                return 1;
        }

        arg = info[ARG];
        if (! stringp(arg))
        {
                send_exits(me, env);
                return MESSAGE_D->error_msg("你要去哪里？\n");
        }

        if (! mapp(exits = env->query("exits")))
        {
                send_exits(me, env);
                return MESSAGE_D->error_msg("这里四周都没有出口，你无路可走。\n");
        }

        if (! exits[arg])
        {
                send_exits(me, env);
                if (env->query("outdoor"))
                        return MESSAGE_D->error_msg("你抬腿想走，却看到一堵墙。\n");
                else
                        return MESSAGE_D->error_msg("这个方向没有出口。\n");
        }

        call_other(exits[arg], "???");
        if (! find_object(ob = exits[arg]))
        {
                send_exits(me, env);
                return MESSAGE_D->error_msg("系统遇到了错误，无法完成你的操作。\n");
        }

        if (! wizardp(me) || ! me->query("env/invisible"))
        {
                message("vision", me->name() + "飘飘忽忽的离开这里。\n",
                        environment(me), ({ me }));
                message("vision", me->name() + "飘飘忽忽的游荡了过来。\n",
                        ob, ({ me }));
        }

        if (! me->move(ob))
        {
                send_exits(me, env);
                return MESSAGE_D->error_msg("你无法移动到指定的地点。\n");
        }

        return 1;
}

void send_exits(object me, object env)
{
        if (mapp(env->query("exits")))
                // notice the user all the exits
                MESSAGE_D->tell_user(me, FUN_EXITS, implode(keys(env->query("exits")), "\n"));
}

