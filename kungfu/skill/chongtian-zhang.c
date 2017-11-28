// 杜撰的苗家掌法，招数名称与其剑法相近

inherit SKILL;

mapping *action = ({
([      "action": "$N双掌骤起，一招「下步摘星势」，一掌击向$n面门，另一掌却按向$n小腹",
        "force" : 185,
        "dodge" : 11,
        "parry" : 12,
        "attack": 9,
        "damage": 12,
        "lvl"   : 0,
        "skill_name" : "下步摘星势",
        "damage_type": "瘀伤"
]),
([      "action": "$N双掌互错，变幻莫测，一招「洗剑怀中抱月」，瞬息之间已向$n攻出数掌",
        "force" : 205,
        "dodge" : 18,
        "parry" : 17,
        "attack": 13,
        "damage": 17,
        "lvl"   : 30,
        "skill_name" : "洗剑怀中抱月",
        "damage_type": "瘀伤"
]),
([      "action": "$N一声清啸，呼的一掌，一招「黄龙转身吐须」，去势奇快，向$n猛击过去",
        "force" : 217,
        "dodge" : 16,
        "parry" : 19,
        "attack": 17,
        "damage": 21,
        "lvl"   : 60,
        "skill_name" : "黄龙转身吐须",
        "damage_type": "瘀伤"
]),
([      "action": "$N双掌交错，若有若无，一招「上步云边摘月」，自巧转拙，拍向$n的$l",
        "force" : 225,
        "dodge" : 24,
        "parry" : 21,
        "attack": 22,
        "damage": 33,
        "lvl"   : 90,
        "skill_name" : "上步云边摘月",
        "damage_type": "瘀伤"
]),
([      "action": "$N一招「提撩剑白鹤舒翅」，右手一拳击出，左掌紧跟着在右拳顺势击向$n的$l",
        "force" : 255,
        "dodge" : 24,
        "parry" : 28,
        "attack": 33,
        "damage": 41,
        "lvl"   : 120,
        "skill_name" : "提撩剑白鹤舒翅",
        "damage_type": "瘀伤"
]),
([      "action": "$N双手齐划，跟着双掌齐推，一招「冲天掌苏秦背剑」，一股排山般掌力直扑$n",
        "force" : 267,
        "dodge" : 28,
        "parry" : 30,
        "attack": 36,
        "damage": 49,
        "lvl"   : 150,
        "skill_name" : "冲天掌苏秦背剑",
        "damage_type": "瘀伤"
]),
});

int valid_enable(string usage) { return usage == "strike" || usage == "parry"; }

int valid_combine(string combo) { return combo == "panlong-zhao"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练白鹤冲天掌必须空手。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候不够，无法学白鹤冲天掌。\n");

        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力太弱，无法练白鹤冲天掌。\n");

        if ((int)me->query_skill("strike", 1) < 60)
                return notify_fail("你的基本掌法火候太浅。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("chongtian-zhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的白鹤冲天掌。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action) - 1; i >= 0; i--)
            if (level >= action[i]["lvl"])
                return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("chongtian-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够练白鹤冲天掌。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -90);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"chongtian-zhang/" + action;
}
