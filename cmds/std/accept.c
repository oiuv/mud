// ai.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        object ob;
        string r;

	if (environment(me)->query("pigging"))
		return notify_fail("你还是安心的拱猪吧！\n");

        if (! objectp(ob = STORY_D->query_running_story())
            || base_name(ob) != STORY_DIR + "challenge")
                return notify_fail("现在没有人来挑战，你瞎动什么？\n");

	if (me->is_in_prison())
		return notify_fail("好好的做你的牢吧。\n");

	if (me->is_ghost())
		return notify_fail("你还是等还了阳再说吧。\n");

        if (wizardp(me))
                return notify_fail("你一个巫师捣什么乱？\n");

        if (me->is_busy())
                return notify_fail("你现在正忙，等有空了再说吧！\n");

        if (me->is_fighting())
                return notify_fail("你还是把眼前的敌人放倒再说吧！\n");

        if (r = ob->cannot_accept(me))
                return notify_fail(r);

        ob->accept_for_challenge(me);
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : accept

接收来自挑战者的挑战。当然的有人向你挑战才可以。

其他相关指令: fight, hit

HELP );
        return 1;
}

