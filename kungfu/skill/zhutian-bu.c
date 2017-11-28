// zhutian-bu.c 诸天化身步
// modified by Venus Oct.1997
// written by That

inherit SKILL;

string *dodge_msg = ({
    "只见$n一招「天地钩」，身体腾空，双足向上，笔直地纵起丈余，躲过了$N这一招。\n",
    "$n身随意转，一式「凤点头」头部前挺，侧身收腹，倏地往一旁挪开了三尺，避过了这一招。\n",
    "$n双足抓地，身形微晃，一招「鹰爪松」有惊无险地避开了$N这一招。\n"
    "但是$n身形飘忽，一式「风摆柳」，轻轻一纵，早已避开。\n",
    "$n一个「阴阳箭」，向后纵出数丈之远，避开了$N的凌厉攻势，立即又欺近$N身旁。\n",
    "$n使出「日月扣」，双手如钩向一旁飘然纵出，轻轻着地。\n"
});

int valid_enable(string usage) { return (usage == "dodge") || (usage == "move"); }

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
    return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
    if((int)me->query("qi") < 50 )
        return notify_fail("你的体力太差了，不能练诸天化身步。\n");

    me->receive_damage("qi", 40);
    return 1;
}
