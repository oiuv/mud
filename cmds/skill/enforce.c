#include <ansi.h>
inherit F_CLEAN_UP;

int main(object me, string arg)
{
	int max, pts;

        // 狂暴铁拳增加加力上限
        if (me->query("special_skill/might"))
                max = (int)me->query_skill("force") * 2 / 3;
        else
                max = (int)me->query_skill("force") / 2;

	if (! arg || (arg != "none" && arg != "max"
           && arg != "half" && ! sscanf(arg, "%d", pts)))
		return notify_fail("\n指令格式：enforce|jiali <使出几点内力伤敌>"
                                   "|max|half|none \n你现在最多能用" HIY +
                                   chinese_number(max) + NOR "点内力伤敌。\n");

	if (! me->query_skill_mapped("force"))
		return notify_fail("你必须先 enable 一种内功。\n");

	if (arg == "none")
		me->delete("jiali");
	else
	{
		if (arg == "max")
			pts = max;

		if (arg == "half")
			pts = max / 2;

		if (pts < 0)
			return notify_fail("你只能用 none 表示不运内力，或数字"
                                           "表示每一击用几点内力。\n");

		if (pts > max)
			return notify_fail("你最多只能用" HIY + chinese_number(max)
                                           + NOR "点内力伤敌。\n");

		me->set("jiali", pts);
	}
	if (! me->query("jiali"))
		write(HIC "你决定放弃使用内力加力。\n" NOR);
	else
		write(HIC "你决定用" HIY + chinese_number(pts) + HIC "点内力伤敌。\n" NOR);
	return 1;
}

int help (object me)
{
        write(@HELP
指令格式: enforce|jiali <使出几点内力伤敌>|max|half|none

这个指令让你指定每次击中敌人时，要发出几点内力伤敌。其中 max
表示你将使用最大限额的加力点数伤敌。half表示使用最大限额一半
的加力点数伤敌。而none则表示你不再使用内力加力。

HELP);
        return 1;
}
