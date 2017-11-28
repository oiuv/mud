#include <ansi.h>
inherit F_CLEAN_UP;

int main(object me, string arg)
{
	int max, pts;

        // 愤怒之心增加加怒上限
        if (me->query("special_skill/wrath"))
                max = me->query_max_craze() / 70;
        else
                max = me->query_max_craze() / 100;

        if (max < 1)
                return notify_fail("你的性格不合，无法使用愤怒攻击。\n");

	if (! arg || (arg != "none" && arg != "max"
           && arg != "half" && ! sscanf(arg, "%d", pts)))
                return notify_fail("\n指令格式：pique|jianu <使出几成愤"
                                   "怒伤敌> |max|half|none \n你现在最多"
                                   "能用" HIG + chinese_number(max) + NOR
                                   "点愤怒值伤敌。\n");

	if (arg == "none")
		me->delete("jianu");
	else
	{
		if (arg == "max")
			pts = max;

		if (arg == "half")
			pts = max / 2;

		if (pts < 0)
			return notify_fail("你只能用 none 表示不用愤怒，或数字"
                                           "表示每一击用几点愤怒值。\n");

		if (pts > max)
			return notify_fail("你最多只能用" HIG + chinese_number(max)
                                           + NOR "点愤怒值伤敌。\n");

		me->set("jianu", pts);
	}
	if (! me->query("jianu"))
		write(HIC "你决定放弃使用愤怒值伤敌。\n" NOR);
	else
		write(HIR "你决定用" HIG + chinese_number(pts) +
                      HIR "点愤怒值伤敌。\n" NOR);
	return 1;
}

int help (object me)
{
        write(@HELP
指令格式: pique|jianu <使出几点愤怒值伤敌>|max|half|none
 
这个指令让你指定每次击中敌人时，发出几点愤怒伤害对方。如果使
用愤怒伤敌，则在攻击中还有一定的几率可以使出愤怒必杀技暴怒招
式。其中 max 表示你将使用最大限额的愤怒值伤敌。half 表示使用
最大限额一半的愤怒值伤敌。而none则表示你不再使用愤怒值伤敌。

相关指令：激怒(berserk)，发泄(burning)

HELP);
        return 1;
}
