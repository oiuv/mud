// renshu 东洋忍术

inherit SKILL;

string *dodge_msg = ({
	"$n身子一扭，姿势颇为怪异，躲过了$N这一招。\n",
	"可是$n突然抱头滚地而走，躲过了$N这一招。\n",
	"$n突然身边弥漫起一团白雾，让$N失去了方向。\n",
	"$n忽然身形加快，使$N失去了$n的踪迹。\n",
        "$n突然匍匐于地，使$N招数全然落空。\n",
});

int valid_enable(string usage) { return (usage == "dodge") || (usage == "move"); }

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
        if( (int)me->query("qi") < 50 )
                return notify_fail("你的体力太差了，无法练习东洋忍术。\n");

        me->receive_damage("qi", 40);
        return 1;
}
