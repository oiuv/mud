inherit SKILL;

mapping *action = ({
([      "action": "$N一招「吹梅笛怨」，双手横挥，抓向$n",
        "force" : 80,
        "attack": 25,
        "dodge" : 20,
        "parry" : 25,
        "damage": 10,
        "lvl"   : 0,
        "skill_name" : "吹梅笛怨",
        "damage_type" : "瘀伤"
]),
([      "action": "$N一招「黄昏独自愁」，身子跃然而起，抓向$n的头部",
        "force" : 100,
        "attack": 28,
        "dodge" : 20,
        "parry" : 27,
        "damage": 20,
        "lvl"   : 30,
        "skill_name" : "黄昏独自愁",
        "damage_type" : "瘀伤"
]),
([      "action": "$N一招「寒山一带伤心碧」，双手纷飞，$n只觉眼花缭乱",
        "force" : 120,
        "attack": 32,
        "dodge" : 30,
        "parry" : 28,
        "damage": 30,
        "lvl"   : 60,
        "skill_name" : "寒山一带伤心碧",
        "damage_type" : "瘀伤"
]),
([      "action": "$N一招「梅花雪落覆白苹」，双手合击，$n只觉无处可避",
        "force" : 150,
        "attack": 33,
        "dodge" : 30,
        "parry" : 33,
        "damage": 35,
        "lvl"   : 80,
        "skill_name" : "梅花雪落覆白苹",
        "damage_type" : "瘀伤"
]),
([      "action": "$N一招「砌下落梅如雪乱」，双手飘然抓向$n",
        "force" : 180,
        "attack": 36,
        "dodge" : 30,
        "parry" : 37,
        "damage": 45,
        "lvl"   : 100,
        "skill_name" : "砌下落梅如雪乱",
        "damage_type" : "瘀伤"
]),

([      "action": "$N双手平举，一招「云破月来花弄影」击向$n",
        "force" : 210,
        "attack": 42,
        "dodge" : 35,
        "parry" : 45,
        "damage": 40,
        "lvl"   : 120,
        "skill_name" : "云破月来花弄影",
        "damage_type" : "瘀伤"
]),
([      "action": "$N一招「花开堪折直须折」，拿向$n，似乎$n的全身都被笼罩",
        "force" : 240,
        "attack": 47,
        "dodge" : 30,
        "parry" : 41,
        "damage": 45,
        "lvl"   : 140,
        "skill_name" : "花开堪折直须折",
        "damage_type" : "内伤"
]),

([      "action": "$N左手虚晃，右手一记「红颜未老恩先绝」击向$n的头部",
        "force" : 280,
        "attack": 46,
        "dodge" : 30,
        "parry" : 47,
        "damage": 50,
        "lvl"   : 160,
        "skill_name" : "红颜未老恩先绝",
        "damage_type" : "瘀伤"
]),
([      "action": "$N施出「虚妄笑红」，右手横扫$n的$l，左手攻向$n的胸口",
        "force" : 330,
        "attack": 58,
        "dodge" : 10,
        "parry" : 55,
        "damage": 50,
        "lvl"   : 170,
        "skill_name" : "虚妄笑红",
        "damage_type" : "瘀伤"
]),
([      "action": "$N施出「玉石俱焚」，不顾一切扑向$n",
        "force" : 370,
        "attack": 62,
        "dodge" : 20,
        "parry" : 52,
        "damage": 80,
        "lvl"   : 180,
        "skill_name" : "玉石俱焚",
        "damage_type" : "瘀伤"
])
});

int valid_enable(string usage) { return usage=="parry"|| usage=="hand"; }

int valid_combine(string combo) { return combo=="liuyang-zhang"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练逍遥折梅手必须空手。\n");

        if (me->query("dex") < 30)
                return notify_fail("你先天身法不足，无法学习灵巧的逍遥折梅手。\n");

        if ((int)me->query("max_neili") < 900)
                return notify_fail("你的内力太弱，无法练逍遥折梅手。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功火候不够，无法练逍遥折梅手。\n");

        if ((int)me->query_skill("hand", 1) < 100)
                return notify_fail("你的基本手法火候不够，无法练逍遥折梅手。\n");

        if ((int)me->query_skill("hand", 1) < (int)me->query_skill("zhemei-shou", 1))
                return notify_fail("你的基本手法水平有限，无法领会更高深的逍遥折梅手。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("zhemei-shou",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 90)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练逍遥折梅手。\n");

        me->receive_damage("qi", 85);
        me->add("neili", -72);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"zhemei-shou/" + action;
}
