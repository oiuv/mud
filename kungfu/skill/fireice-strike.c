inherit SKILL;

mapping *action = ({
([      "action": "$N双掌一错，一招「风起云涌」，狂风般扫向$n的$l",
        "force" : 100,
        "attack": 18,
        "dodge" : 30,
        "parry" : 15,
        "damage": 40,
        "lvl"   : 0,
        "damage_type": "瘀伤"
]),
([      "action": "$N一招「风雪满天」，身形突然旋转起来扑向$n，双掌拍向$n的$l",
        "force" : 200,
        "attack": 25,
        "dodge" : 40,
        "parry" : 30,
        "damage": 45,
        "lvl"   : 30,
        "damage_type": "瘀伤"
]),
([      "action": "$N将内力运至左手，一招「万里雪飘」，迅疾无比地抓向$n的$l",
        "force" : 250,
        "attack": 35,
        "dodge" : 50,
        "parry" : 55,
        "damage": 45,
        "lvl"   : 60,
        "damage_type": "瘀伤"
]),
([      "action": "$N后退一步，突然一招「千里冰封」，掌力拍向$n的$l",
        "force" : 330,
        "attack": 42,
        "dodge" : 40,
        "parry" : 65,
        "damage": 50,
        "lvl"   : 120,
        "damage_type": "瘀伤"
]),
});

int valid_enable(string usage) { return usage == "strike" || usage == "parry"; }

int valid_combine(string combo) { return combo == "meinv-quan"; }

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int)me->query_skill("fireice-strike", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练烈焰寒冰掌必须空手。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候不够，无法练烈焰寒冰掌。\n");

        if ((int)me->query("max_neili") < 450)
                return notify_fail("你的内力太弱，无法练烈焰寒冰掌。\n");

        if (me->query_skill("strike", 1) < me->query_skill("fireice-strike", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的烈焰寒冰掌。\n");

        return 1;
}


int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了，先休息一下吧。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练烈焰寒冰掌。\n");

        if (me->query_skill("fireice-strike", 1) < 50)
                me->receive_damage("qi", 30);
        else
                me->receive_damage("qi", 50);

        me->add("neili", -54);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"fireice-strike/" + action;
}
