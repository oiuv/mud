// feiyan-huixiang.c 飞燕回翔
// modified by Venus Oct.1997
// pyrobat-steps.c

inherit SKILL;

string *dodge_msg = ({
    "但是$n身形飘忽，轻轻一纵，一招「乳燕投林」，举重若轻的避开这一击。\n",
    "$n身随意转，一式「雪花飞舞」，倏地往一旁飘开数尺，避过了这一招。\n",
    "可是$n侧身一让，使出「柳絮轻飘」，$N这一招扑了个空。\n",
    "却见$n足不点地，一招「腾云驾雾」，身形滴溜溜一转，往旁闪开数尺，躲了开去。\n",
    "$n左脚一点右脚背，身形往上一拔，一招「一鹤冲天」，轻轻巧巧地避开了这一招。\n"
});

int valid_enable(string usage)
{
    return (usage=="dodge") || (usage=="move");
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
        return notify_fail("你的体力太差了，不能练飞燕回翔。\n");

    me->receive_damage("qi", 40);
    return 1;
}
