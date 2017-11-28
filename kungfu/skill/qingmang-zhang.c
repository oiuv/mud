inherit SKILL;

mapping *action = ({
([      "action": "$N前腿踢出，后腿脚尖点地，一式「横空出世」，二掌直出，攻向$n"
                  "的上中下三路",
        "force" : 120,
        "attack": 17,
        "dodge" : 5,
        "parry" : 12,
        "damage": 5,
        "lvl"   : 0,
        "damage_type" : "瘀伤",
]),
([      "action": "$N左掌划一半圆，一式「长虹贯日」，右掌斜穿而出，疾拍$n的胸前"
                  "大穴",
        "force" : 150,
        "attack": 25,
        "dodge" : 5,
        "parry" : 18,
        "damage": 10,
        "lvl"   : 10,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使一式「云断秦岭」，右掌上引，左掌由后而上一个甩劈，斩向$n"
                  "的$l",
        "force" : 170,
        "attack": 32,
        "dodge" : 6,
        "parry" : 22,
        "damage": 10,
        "lvl"   : 20,
        "damage_type" : "劈伤",
]),
([      "action": "$N左掌护胸，右拳凝劲后发，一式「铁索拦江」，缓缓推向$n的$l",
        "force" : 190,
        "attack": 38,
        "dodge" : -5,
        "parry" : 32,
        "damage": 10,
        "lvl"   : 40,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使一式「狂风卷地」，全身飞速旋转，双掌一前一后，猛地拍向$n"
                  "的胸口",
        "force" : 210,
        "attack": 51,
        "dodge" : 10,
        "parry" : 27,
        "damage": 15,
        "lvl"   : 70,
        "damage_type" : "瘀伤",
]),
([      "action": "$N合掌抱球，猛吸一口气，一式「怀中抱月」，双掌疾推向$n的肩头",
        "force" : 250,
        "attack": 52,
        "dodge" : 5,
        "parry" : 38,
        "damage": 15,
        "lvl"   : 90,
        "damage_type" : "瘀伤",
]),
([      "action": "$N向上高高跃起，一式「高山流水」，居高临下，掌力笼罩$n的全身",
        "force" : 280,
        "attack": 62,
        "dodge" : 20,
        "parry" : 56,
        "damage": 15,
        "lvl"   : 110,
        "damage_type" : "瘀伤",
]),
});

int valid_enable(string usage) { return usage=="strike" ||  usage=="parry"; }  

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练青莽掌必须空手。\n");

        if ((int)me->query_skill("force") < 20)
                return notify_fail("你的内功心法火候不够，无法修炼青莽掌。\n");

        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力太弱，无法练青莽掌。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("qingmang-zhang", 1))
                return notify_fail("你的基本掌法火候有限，无法领会更高深的青莽掌。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action)-1; i >= 0; i--)
                if (level >= action[i - 1]["lvl"])
                        return action[i - 1]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int)me->query_skill("qingmang-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 40)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 40)
                return notify_fail("你的内力不够练青莽掌。\n");

        me->receive_damage("qi", 30);
        me->add("neili", -30);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"qingmang-zhang/" + action;
}
