// yaowang-shenxin.c 药王神辛
// Edit By Vin On 26/2/2001
// 很难学的知识技能，达到二百五十级可以栽培七星海棠。

inherit SKILL;

string type() { return "knowledge"; }

int valid_enable(string usage) { return usage == "poison"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("poison", 1) < 150)
                return notify_fail("你的基本毒技造诣太浅，无"
                                   "法领会深奥的药王神辛。\n");

        if ((int)me->query_skill("dispel-poison", 1) < 150)
                return notify_fail("你的妙手驱毒造诣太浅，无"
                                   "法领会深奥的药王神辛。\n");

        if ((int)me->query_skill("poison", 1) < (int)me->query_skill("yaowang-shenxin", 1))
                return notify_fail("你的基本毒技水平有限，无"
                                   "法掌握更深奥的药王神辛。\n");

        if ((int)me->query_skill("dispel-poison", 1) < (int)me->query_skill("yaowang-shenxin", 1))
                return notify_fail("你的妙手驱毒水平有限，无"
                                   "法掌握更深奥的药王神辛。\n");

        return 1;
}

int practice_skill(object me)
{
        return notify_fail("药王神辛只能通过学习获得长进。\n");
}
