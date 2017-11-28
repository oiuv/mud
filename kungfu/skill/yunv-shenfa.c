inherit SKILL;

string *dodge_msg = ({
        "但是$n身形一转，使出「麝熏微度」，蓦地不见，避开了这一招。\n",
        "$n一招「西施浣纱」，身随意转，倏地往一旁挪开了三尺。\n",
        "$n身形飘忽，瞻之在前，忽焉在后，却是「走马兰台」的身法。\n",
        "$n使出「洛河清波」，犹如在水面滑行一般，身形晃了开去。\n",
        "可是$n的身影飘飘渺渺，竟丝毫不着力，是一式「蓬山万重」的身法。\n"
});

int valid_enable(string usage)
{
        return (usage == "dodge") || (usage == "move");
}

int valid_learn(object me) 
{ 
        return 1; 
}

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
        if( (int)me->query("qi") < 50 )
                return notify_fail("你的体力太差了，不能练玉女身法。\n");

        me->receive_damage("qi", 40);
        return 1;
}


