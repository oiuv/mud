// accede.c
// 系统任务 ultra_quest 的相关文件

#include <ansi.h>
inherit F_CLEAN_UP;

int main(object me, string arg)
{
        object ob;
//      mapping q;
        string type;

        while (arg)
        {
                // 没有任务，则返回
                if (! me->query("ultra_quest/quest"))
                        return notify_fail("刚才没人向你寻求帮助。\n");

                // 查看当前 ultra_quest 特殊任务的状态
                if (! stringp(type = me->query("ultra_quest/quest/type"))
                   || (type != "mathematics"            // 比试演算
                   && type != "literate"                // 比试诗词
                   && type != "chess"                   // 比试棋技
                   && type != "calligraphy"             // 帮忙书法
                   && type != "drawing"                 // 帮忙绘画
                   && type != "medical"))               // 帮忙治病
                        return notify_fail("刚才没人向你寻求帮助。\n");

                if (! objectp(ob = present(arg, environment(me))))
                        return notify_fail("这里没有这个人。\n");

                if (ob->query_temp("need_accede/user") != me->query("id")) 
                        return notify_fail(CYN + ob->name() + CYN "瞪眼"
                                           "望着你道：你是谁？找我有什么"
                                           "事？\n" NOR);

                if (ob == me)
                        return notify_fail("自己应酬自己？\n");

                if (me->is_fighting())
                        return notify_fail("你还是打完架再说吧。\n");

                if (me->is_busy())
                        return notify_fail("你还是有空了再说吧。\n");

                if (! ob->query("can_speak"))
                        return notify_fail("你大脑有水？\n");

                if (! living(ob))
                        return notify_fail("你还是等" + ob->name() +
                                           "醒了后再说吧。\n");

                if (ob->is_fighting())
                        return notify_fail("你还是等" + ob->name() +
                                           "打完架再说吧。\n");

                if (ob->is_busy())
                        return notify_fail("你还是等" + ob->name() +
                                           "忙完了再说吧。\n");

                notify_fail(CYN + ob->name() + CYN "瞪眼望着你道：你是谁"
                            "？找我有什么事？\n" NOR);

                return ob->need_accede(me);
        }
        write("你打算应酬谁？\n");
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式：accede <某人>

这个指令可以让你应酬某些人对你提出的要求。
HELP);
        return 1;
}