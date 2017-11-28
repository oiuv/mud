inherit SKILL;

mapping *action = ({
([      "action": "在呼呼风声中，$N使一招「捕风捉影」，双手如钩如戢，插向$n的$l",
        "force" : 80,
        "attack": 25,
        "dodge" : 20,
        "parry" : 25,
        "damage": 10,
        "lvl"   : 0,
        "damage_type" : "瘀伤"
]),
([      "action": "$N双拳挥舞，一式「浮云去来」，两手环扣，拢成圈状，猛击$n的下颌",
        "force" : 100,
        "attack": 28,
        "dodge" : 20,
        "parry" : 27,
        "damage": 20,
        "lvl"   : 30,
        "damage_type" : "瘀伤"
]),
([      "action": "$N一招「飞龙献爪」，双手纷飞，$n只觉眼花缭乱",
        "force" : 120,
        "attack": 32,
        "dodge" : 30,
        "parry" : 28,
        "damage": 30,
        "lvl"   : 60,
        "damage_type" : "瘀伤"
]),
([      "action": "$N左手护胸，腋下含空，右手五指如钩，一招「抱残守缺」插向$n的顶门",
        "force" : 150,
        "attack": 33,
        "dodge" : 30,
        "parry" : 33,
        "damage": 35,
        "lvl"   : 80,
        "damage_type" : "瘀伤"
]),
([      "action": "$N一手顶天成爪，一手指地，一招「拨云见日」，劲气笼罩$n的全身",
        "force" : 180,
        "attack": 36,
        "dodge" : 30,
        "parry" : 37,
        "damage": 45,
        "lvl"   : 100,
        "damage_type" : "瘀伤"
]),

([      "action": "$N双手平举，一招「苍龙出水」，身形化作一道闪电射向$n",
        "force" : 210,
        "attack": 42,
        "dodge" : 35,
        "parry" : 45,
        "damage": 40,
        "lvl"   : 120,
        "damage_type" : "瘀伤"
]),
([      "action": "$N一招「云中现爪」，拿向$n，似乎$n的全身都被笼罩",
        "force" : 240,
        "attack": 47,
        "dodge" : 30,
        "parry" : 41,
        "damage": 45,
        "lvl"   : 140,
        "damage_type" : "内伤"
]),

([      "action": "$N左手虚晃，右手一记「龙飞在天」击向$n的头部",
        "force" : 260,
        "attack": 46,
        "dodge" : 30,
        "parry" : 47,
        "damage": 50,
        "lvl"   : 160,
        "damage_type" : "瘀伤"
]),
});

int valid_enable(string usage) { return usage=="parry"|| usage=="hand"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练飞龙探云手必须空手。\n");

        if ((int)me->query("max_neili") < 2500)
                return notify_fail("你的内力太弱，无法练飞龙探云手。\n");

        if ((int)me->query_skill("force") < 200)
                return notify_fail("你的内功火候不够，无法练飞龙探云手。\n");

        if ((int)me->query_skill("hand", 1) < 150)
                return notify_fail("你的基本手法火候不够，无法练飞龙探云手。\n");

        if ((int)me->query_skill("hand", 1) < (int)me->query_skill("feilong-shou", 1))
                return notify_fail("你的基本手法水平有限，无法领会更高深的飞龙探云手。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("feilong-shou",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练飞龙探云手。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -62);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"feilong-shou/" + action;
}

