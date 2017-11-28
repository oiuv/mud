inherit SKILL;

mapping *action = ({
([      "action": "$N微一躬身，$w携带着刺耳的飕飕风声，擦地扫向$n的脚踝",
        "force" : 70,
        "attack": 10,
        "dodge" : -5,
        "parry" : 9,
        "damage": 15,
        "damage_type":"挫伤"
]),
([      "action": "$N右手托住杖端，左掌居中一击，令其凭惯性倒向$n的肩头",
        "force" : 101,
        "attack": 15,
        "dodge" : -10,
        "parry" : 15,
        "damage": 15,
        "damage_type":"挫伤"
]),
([      "action": "$N一声狂喝，举起$w乒乒乓乓地满地乱敲，让$n左闪右避，狼狈不堪",
        "force" : 122,
        "attack": 20,
        "dodge" : -5,
        "parry" : 19,
        "damage": 20,
        "damage_type":"挫伤"
]),
([      "action": "$N飞身跃起，身下$w往横里直打而出，挥向$n的裆部",
        "force" : 168,
        "attack": 45,
        "dodge" : -5,
        "parry" : 55,
        "damage": 50,
        "lvl"   : 130,
        "damage_type":"挫伤"
]),
([      "action": "$N高举$w，身形如鬼魅般飘出，对准$n的天灵盖一杖打下",
        "force" : 189,
        "attack": 51,
        "dodge" : -5,
        "parry" : 62,
        "damage": 60,
        "damage_type":"挫伤"
]),
([      "action": "$N双眼发红，将手中$w舞成千百根相似，根根砸向$n全身各处要害",
        "force" : 212,
        "attack": 55,
        "dodge" : -5,
        "parry" : 67,
        "damage": 60,
        "damage_type":"挫伤"
]),
});

int valid_enable(string usage)
{
        return usage == "staff" || usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力修为不足，无法学习疯魔杖法。\n");

        if ((int)me->query_skill("force") < 90)
                return notify_fail("你的内功火候太浅，无法学习疯魔杖法。\n");

        if ((int)me->query_skill("staff", 1) < 30)
                return notify_fail("你的基本杖法太浅，无法学习疯魔杖法。\n");

        if ((int)me->query_skill("staff", 1) < (int)(int)me->query_skill("fengmo-zhang", 1))
                return notify_fail("你的基本杖法水平有限，无法领会更高深的疯魔杖法。\n");

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
        level = (int) me->query_skill("fengmo-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "staff")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练疯魔杖法。\n");

        if ((int)me->query("neili") < 75)
                return notify_fail("你的内力不够练疯魔杖法。\n");

        me->receive_damage("qi", 70);
        me->add("neili", -69);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"fengmo-zhang/" + action;
}
