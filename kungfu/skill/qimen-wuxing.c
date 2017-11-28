// qimen-wuxing

inherit SKILL;

void create() { seteuid(getuid()); }

string type() { return "knowledge"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("mathematics", 1) < 200)
                return notify_fail("你的算术知识太差，无法理解奇门五行的奥妙。\n");

        if ((int)me->query_skill("mathematics", 1) < (int)me->query_skill("qimen-wuxing", 1))
                return notify_fail("你的算术知识有限，无法理解更深奥的奇门五行。\n");

        return 1;
}

int practice_skill(object me)
{
	return notify_fail("奇门五行能靠学(learn)来提高。\n");
}
