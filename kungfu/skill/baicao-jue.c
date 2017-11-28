// baicao-jue.c 百草诀
// Edit By Vin On 26/2/2001
// 很难学的知识技能，达到二百五十级可以栽培七星海棠。

inherit SKILL;

string type() { return "knowledge"; }

int valid_enable(string usage) { return usage == "medical"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("medical", 1) < 150)
                return notify_fail("你的基本医术造诣太浅，无"
                                   "法领会深奥的百草诀。\n");

        if ((int)me->query_skill("yaowang-miaoshu", 1) < 150)
                return notify_fail("你的药王妙术造诣太浅，无"
                                   "法领会深奥的百草诀。\n");

        if ((int)me->query_skill("medical", 1) < (int)me->query_skill("baicao-jue", 1))
                return notify_fail("你的基本医术水平有限，无"
                                   "法掌握更深奥的百草诀。\n");

        if ((int)me->query_skill("yaowang-miaoshu", 1) < (int)me->query_skill("baicao-jue", 1))
                return notify_fail("你的药王妙术水平有限，无"
                                   "法掌握更深奥的百草诀。\n");

        return 1;
}

int practice_skill(object me)
{
        return notify_fail("百草诀只能通过学习获得长进。\n");
}
