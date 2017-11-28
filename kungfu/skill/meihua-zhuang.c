inherit SKILL;

string *dodge_msg = ({
        "$n一个「银鹭渡海」，跃起数尺，躲过了$N这一招。\n",
        "$n身形向后一纵，使出一招「玉兔落尘」，避过了$N的攻击。\n",
        "可是$n身形向后一纵，使出一招「梅花三弄」，避过了$N的攻击。\n",
        "$n使出「锦鲤穿沙」，恰好躲过了$N的攻势。\n",
        "$n一招「灵狐幻遁」，姿态美妙地躲了开去。\n"
        "可是$n一招「踏雪寻梅」，姿态美妙地躲了开去。\n"
});

int valid_enable(string usage)
{
        return (usage == "dodge") || (usage == "move");
}

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
        if( (int)me->query("qi") < 50 )
                return notify_fail("你的体力太差了，不能练天罡梅花桩。\n");

        if( (int)me->query("neili") < 40 )
                return notify_fail("你的内力不够练天罡梅花桩。\n");

        me->receive_damage("qi", 40);
        me->add("neili", -30);
        return 1;
}
