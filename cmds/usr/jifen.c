// jifen.c 积分查询和管理指令
// 玩家积分可通过报告BUG、每日打卡等方式获取，保存在state/jifen

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
    object ob;

    string sp;
    int jifen;

    seteuid(getuid(me));

    if (!arg)
        ob = me;
    else if (wizardp(me) && wiz_level(me) >= 3)
    {
        // 添加积分
        if (sscanf(arg, "+ %s %d", arg, jifen) == 2)
        {
            if (!objectp(ob = find_player(arg)))
                ob = UPDATE_D->global_find_player(arg);
            if (!objectp(ob))
                return notify_fail("你要添加谁的积分？\n");
            if (jifen <= 0)
                return notify_fail("你到底是想添加还是减少？\n");
            ob->add("state/jifen", jifen);
            sp = sprintf("用户 " WHT "%s" NOR " 的积分"
                         "增加了 " WHT "%d" NOR " 点，现为" WHT " %d " NOR "点。\n",
                         arg, jifen,
                         ob->query("state/jifen", 1));

            tell_object(ob, HIG + me->name() + "增加了你的 " +
                                jifen + " 点积分。\n" NOR);

            log_file("static/jifen", sprintf("%s wizard %s add %d jifen to user %s.\n",
                                           log_time(), log_id(me), jifen, log_id(ob)));

            UPDATE_D->global_destruct_player(ob);

            tell_object(me, sp);
            return 1;
        }
        // 减少积分
        if (sscanf(arg, "- %s %d", arg, jifen) == 2)
        {
            if (!objectp(ob = find_player(arg)))
                ob = UPDATE_D->global_find_player(arg);
            if (!objectp(ob))
                return notify_fail("你要减少谁的积分？\n");
            if (jifen <= 0)
                return notify_fail("你到底是想减少还是添加？\n");
            if (ob->query("state/jifen") < 0)
                ob->set("state/jifen", 0);
            ob->add("state/jifen", -jifen);

            sp = sprintf("用户 " WHT "%s" NOR " 的积分"
                         "减少了 " WHT "%d" NOR " 点，现为" WHT " %d " NOR "点。\n",
                         arg, jifen,
                         ob->query("state/jifen", 1));

            tell_object(ob, HIG + me->name() + "减少了你的 " +
                                jifen + " 点积分。\n" NOR);

            log_file("static/jifen", sprintf("%s wizard %s minus %d jifen to user %s.\n",
                                           log_time(), log_id(me), jifen, log_id(ob)));

            UPDATE_D->global_destruct_player(ob);

            tell_object(me, sp);
            return 1;
        }

        ob = present(arg, environment(me));
        if (!ob || !ob->is_character())
            ob = find_player(arg);
        if (!ob || !ob->is_character())
            ob = find_living(arg);
        if (!ob || !ob->is_character())
            return notify_fail("你要察看谁的报告点数？\n");

        if (!userp(ob))
            return notify_fail("只有玩家才具有此参数。\n");
    }
    else
        return notify_fail("只有巫师能察看别人的状态。\n");

    jifen = ob->query("state/jifen", 1);

    if (!jifen)
        sp = ((ob == me ? "你" : ob->name()) + "在" +
              MUD_NAME + NOR "中尚无积分记录。\n");
    else
        sp = ((ob == me ? "你" : ob->name()) + "在" +
              MUD_NAME + NOR "中的积分为" HIC + jifen + NOR "点。\n");

    tell_object(me, sp);
    return 1;
}

int help(object me)
{
    write(@HELP
指令格式： jifen
           jifen       <对象名称>               (巫师专用)
           jifen       [+|- <对象名称> <点数>]  (巫师专用)

这个指令可以显示你在游戏中的积分。积分可通过以下方式获取：
- 报告BUG：根据BUG严重程度获得相应积分
- 每日祈祷：在扬州武庙2楼祈祷获得积分
- 参与活动：参加游戏活动获得积分

积分可在扬州客店的店小二处兑换各种奖励。

巫师可以使用 +|- 参数添加或减少玩家的积分。

HELP);
    return 1;
}
