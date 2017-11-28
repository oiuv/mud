inherit SKILL;

mapping *action = ({
([      "action": "$N微一躬身，使出「修罗索命」，$w携带着刺耳风声，擦地扫向$n的脚踝",
        "force" : 100,
        "attack": 10,
        "dodge" : -5,
        "parry" : 9,
        "damage": 15,
        "damage_type":"挫伤"
]),
([      "action": "$N右手托住杖端，一招「招魂悼魄」居中一击，令其凭惯性倒向$n的肩头",
        "force" : 110,
        "attack": 15,
        "dodge" : -10,
        "parry" : 15,
        "damage": 15,
        "damage_type":"挫伤"
]),
([      "action": "$N一声狂喝，施一招「判官翻簿」，举起$w地满地乱敲，铺天盖地袭向$n",
        "force" : 120,
        "attack": 20,
        "dodge" : -5,
        "parry" : 19,
        "damage": 20,
        "damage_type":"挫伤"
]),
([      "action": "$N飞身跃起，一招「吊客临门」，身下$w往横里直打而出，挥向$n的裆部",
        "force" : 280,
        "attack": 50,
        "dodge" : -5,
        "parry" : 55,
        "damage": 50,
        "lvl"   : 130,
        "damage_type":"挫伤"
]),
([      "action": "$N高举$w施展「无常抖索」，身形如鬼魅般飘出，对准$n的天灵盖一杖打下",
        "force" : 330,
        "attack": 61,
        "dodge" : -5,
        "parry" : 62,
        "damage": 60,
        "damage_type":"挫伤"
]),
([      "action": "$N双眼发红，一招「百鬼恸哭」，将手中$w舞成千百根相似，击向$n全身各处要害",
        "force" : 350,
        "attack": 65,
        "dodge" : -5,
        "parry" : 67,
        "damage": 60,
        "damage_type":"挫伤"
]),
});

int valid_enable(string usage) { return usage == "staff" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 500)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("staff", 1) < (int)(int)me->query_skill("suoming-zhang", 1))
                return notify_fail("你的基本杖法水平有限，无法领会更高深的索命杖法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action)-1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("suoming-zhang",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "staff")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练索命杖法。\n");

        if ((int)me->query("neili") < 75)
                return notify_fail("你的内力不够练索命杖法。\n");

        me->receive_damage("qi", 70);
        me->add("neili", -69);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"suoming-zhang/" + action;
}
