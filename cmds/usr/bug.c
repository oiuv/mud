// bug.c
 
#include <ansi.h>
 
inherit F_CLEAN_UP;
 
int main(object me, string arg)
{
        object ob;

        string sp/*, add*/;
        int bug/*, bugp*/;

        seteuid(getuid(me));

        if (! arg)
                ob = me;
        else
        if (wizardp(me) && wiz_level(me) >= 3)
        {
                // 添加 bug 点数
                if (sscanf(arg, "+ %s %d", arg, bug) == 2)
                {
                        if (! objectp(ob = find_player(arg)))
                                ob = UPDATE_D->global_find_player(arg);
                        if (! objectp(ob))
                                return notify_fail("你要添加谁的报告点"
                                                   "数？\n");
                        if (bug <= 0)
                                return notify_fail("你到底是想添加还是"
                                                   "减少？\n");
                        ob->add("bug", bug);
                        sp = sprintf("用户 " WHT "%s" NOR " 的报告点数"
                                     "增加了 " WHT "%d" NOR " 点，现为"
                                     WHT " %d " NOR "点。\n", arg, bug,
                                     ob->query("bug", 1));

                        tell_object(ob, HIG + me->name() + "增加了你的 " +
                                        bug + " 点报告点数。\n" NOR);

                        log_file("static/bug", sprintf("%s wizard %s a"
                                 "dd   %d bug point to user %s.\n",
                                 log_time(), log_id(me), bug, log_id(ob)));

                        UPDATE_D->global_destruct_player(ob);

                        tell_object(me, sp);
                        return 1;
                }
                // 减少 bug 点数
                if (sscanf(arg, "- %s %d", arg, bug) == 2)
                {
                        if (! objectp(ob = find_player(arg)))
                                ob = UPDATE_D->global_find_player(arg);
                        if (! objectp(ob))
                                return notify_fail("你要减少谁的报告点"
                                                   "数？\n");
                        if (bug <= 0)
                                return notify_fail("你到底是想减少还是"
                                                   "添加？\n");
                        if (ob->query("bug") < 0)
                                ob->set("bug", 0);
                        ob->add("bug", -bug);

                        sp = sprintf("用户 " WHT "%s" NOR " 的报告点数"
                                     "减少了 " WHT "%d" NOR " 点，现为"
                                     WHT " %d " NOR "点。\n", arg, bug,
                                     ob->query("bug", 1));

                        tell_object(ob, HIG + me->name() + "减少了你的 " +
                                        bug + " 点报告点数。\n" NOR);

                        log_file("static/bug", sprintf("%s wizard %s m"
                                 "inus %d bug point to user %s.\n",
                                 log_time(), log_id(me), bug, log_id(ob)));

                        UPDATE_D->global_destruct_player(ob);

                        tell_object(me, sp);
                        return 1;
                }
                
                ob = present(arg, environment(me));
                if (! ob || ! ob->is_character()) ob = find_player(arg);
                if (! ob || ! ob->is_character()) ob = find_living(arg);
                if (! ob || ! ob->is_character())
                        return notify_fail("你要察看谁的报告点数？\n");

                if (! userp(ob))
                        return notify_fail("只有玩家才具有此参数。\n");
                        
        } else
                return notify_fail("只有巫师能察看别人的状态。\n");
 
        bug = ob->query("bug", 1);

        if (! bug)
                sp = ((ob == me ? "你" : ob->name()) + "在" +
                         MUD_NAME + NOR "中尚无报告过任何错误。\n");
        else
                sp = ((ob == me ? "你" : ob->name()) + "在" +
                         MUD_NAME + NOR "中的错误报告积累点数为"
                         HIC + bug + NOR "点。\n");

        tell_object(me, sp);
        return 1;
}
 
int help(object me)
{
        write(@HELP
指令格式： bug
           bug       <对象名称>               (巫师专用)
           bug       [+|- <对象名称> <点数>]  (巫师专用)

这个指令可以显示你在游戏中的错误报告积累点数。玩家可通过
此点数获得一些奖励。如果有arch权限或以上的巫师在线，可直
接在公众频道汇报错误，这时巫师可视 BUG大小给玩家增加报告
点数。如游戏中无巫师在线，请用正式ID留言到巫师会客室，我
们会在第一时间内修复 BUG及给此ID增加报告点数。（注意，只
有汇报 BUG的ID才能获得点数。如果一个 BUG被数个玩家同时发
现，报告点数将加到最先汇报此 BUG的ID上。）

巫师可以使用 +|- 参数添加或者减少玩家的报告点数。

细小错误：1点           (含错别字、语句不通、帮助遗漏等)
一般错误：3点           (不会影响到游戏正常进行的错误)
严重错误：5点           (视情况而论、包含某些系统错误)
练功错误：10至1000点    (有益于自身修炼及获得利益的错误)

HELP);
        return 1;
}
