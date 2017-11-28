// beidou-xianzong.c

inherit SKILL;

string *dodge_msg = ({
    "只见$n一招「仙踪缈去」，身体飘然后退，躲过了$N这一招。\n",
    "$n一个「星宿易位」，向后纵出数丈之远，避开了$N的凌厉攻势。\n",
    "$n使出「奇星而出」，向一旁飘然纵出，轻轻着地。\n",
    "但是$n一招「无中生有」，身形飘忽，早已避开。\n",
    "$n身随意转，一招「化身金虹」倏的不见踪影。\n",
    "可是$n身形不断闪动，一招「流星破空」$N这一招扑了个空。\n",
    "却见$n足不点地，一招「群星送客」往旁窜开数尺，躲了开去。\n",
    "$n身形微晃，一招「仙过九天」有惊无险地避开了$N这一招。\n",
});

int valid_enable(string usage) { return (usage == "dodge") || (usage == "move");}

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
    return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
    if( (int)me->query("qi") < 50 )
       return notify_fail("你的体力太差了，不能练北斗仙踪步法。\n");

    me->receive_damage("qi", 40);
    return 1;
}
