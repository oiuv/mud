
inherit SKILL;

string *dodge_msg = ({
	"$n身形急转，避过了$N的攻势。\n",
	"可是$n拔地而起，躲过了$N这一招。\n",
	"$n作闪右避，总算躲过了$N这一招。\n",
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
                return notify_fail("你的体力太差了，无法练习圣火步法。\n");

        me->receive_damage("qi", 40);
        return 1;
}
