inherit SKILL;

string type() { return "knowledge"; }

int valid_learn(object me)
{
        int gift, mat;

        gift = 35;
        mat = 300;

        if (me->query("family/family_name") == "桃花岛")
        {
                gift = 30;
                mat = 200;
        }

        if ((int)me->query("int") < gift)
                return notify_fail("你的先天悟性不足，难以领会阴阳八卦的奥妙。\n");

        if ((int)me->query_skill("mathematics", 1) < mat)
                return notify_fail("你的算术知识太差，无法理解阴阳八卦的奥妙。\n");

        if ((int)me->query_skill("mathematics", 1) < (int)me->query_skill("count", 1))
                return notify_fail("你的算术知识有限，无法理解更深奥的阴阳八卦。\n");
        /*
        //由于没开放高悟性互搏，此效果暂无实际效果，故取消。
        //转世特技循影擒踪
        if (me->query_skill("zuoyou-hubo", 1) && !me->query("special_skill/qinzong"))
                return notify_fail("你受到左右互博分心之术影响，难以领会阴阳八卦的奥妙。\n");
*/
        return 1;
}
