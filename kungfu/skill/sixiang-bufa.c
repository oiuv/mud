inherit SKILL;

string *dodge_msg = ({
    "只见$n一招「少阴步」，身体向上笔直地纵起丈余，躲过了$N这一招。\n",
    "$n一个「乾兑步」，向后纵出数丈之远，避开了$N的凌厉攻势。\n",
    "$n使出「离震步」，向一旁飘然纵出，轻轻着地。\n"
    "但是$n身形飘忽，使出「少阳步」，轻轻一纵，早已避开。\n",
    "$n身随意转「太阴步」，倏地往一旁挪开了三尺，避过了这一招。\n",
    "可是$n侧身一让，一个「巽坎步」，$N这一招扑了个空。\n",
});

int valid_enable(string usage)
{
        return (usage == "dodge") ||
               (usage == "move");
}

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int query_effect_dodge(object attacker, object me)
{
        int lvl;

        lvl = me->query_skill("sixiang-bufa", 1);
        if (lvl < 50)  return 0;
        if (lvl < 100) return 10;
        if (lvl < 150) return 20;
        if (lvl < 200) return 30;
        if (lvl < 250) return 40;
        return 50;
}

int practice_skill(object me)
{
        if( (int)me->query("qi") < 70 )
                return notify_fail("你的体力太差了，不能练四象步法。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力太差了，不能练习四象步法。\n");

        me->receive_damage("qi", 58);
        me->add("neili", -65);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"sixiang-bufa/" + action;
}
