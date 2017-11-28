// zhuifeng-steps.c  追风步
// modified by Venus Oct.1997
// by jacki

inherit SKILL;

string *dodge_msg = ({
    "$n一个「随风而舞」，身形飘忽不定，躲过了$N这一招。\n",
    "$n身形飘飘，使出一招「身随意转」，避过了$N的攻击。\n",
    "$n使出「移步换形」，在千钧一发间躲过了$N的攻势。\n",
    "$n衣袂飘飘，一招「事了拂衣去」，潇洒地避了开去。\n"
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
        return notify_fail("你的体力太差了，不能练追风步。\n");

    me->receive_damage("qi", 40);
    return 1;
}
