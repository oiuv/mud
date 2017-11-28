// qufeng.c 驱蜂之术
// By Lgg,1998.9

inherit SKILL;

void create() { seteuid(getuid()); }

string type() { return "knowledge"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("yunv-xinfa", 1) < 30)
                return notify_fail("你的玉女心法火候不够，无法学驱蜂之术。\n");

        if ((int)me->query("max_neili") < 300)
                return notify_fail("你的内力太弱，无法学习驱蜂之术。\n");

        return 1;
}
int practice_skill(object me)
{
        return notify_fail("驱蜂之术只能靠学习来提高。\n");
}
