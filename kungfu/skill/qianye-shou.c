// qianye-shou.c 如来千叶手
// modified by Venus Oct.1997

inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action" : "$N一式「南海礼佛」，右手虚晃，左手扬起，突然拍向$n的背后二穴",
        "force"  : 90,
        "attack" : 15,
        "dodge"  : 10,
        "parry"  : 25,
        "lvl"    : 0,
        "skill_name" : "南海礼佛",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N侧身一晃，一式「金玉瓦砾」，左手拿向$n的肩头，右拳打向$n的胸口",
        "force"  : 110,
        "attack" : 18,
        "dodge"  : 10,
        "parry"  : 35,
        "lvl"    : 30,
        "skill_name" : "金玉瓦砾",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一式「人命呼吸」，右手环拢成爪，一出手就向扣$n的咽喉要害",
        "force"  : 140,
        "attack" : 25,
        "dodge"  : 20,
        "parry"  : 50,
        "damage" : 5,
        "lvl"    : 60,
        "skill_name" : "人命呼吸",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左手虚招，右掌直立，一式「镜里观影」，错步飘出，疾拍$n的面门",
        "force"  : 180,
        "attack" : 31,
        "dodge"  : 20,
        "parry"  : 60,
        "damage" : 10,
        "lvl"    : 90,
        "skill_name" : "镜里观影",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N使一式「水中捉月」，左拳上格，右手探底突出，抓向$n的裆部",
        "force"  : 240,
        "attack" : 42,
        "dodge"  : 30,
        "parry"  : 62,
        "damage" : 15,
        "lvl"    : 110,
        "skill_name" : "水中捉月",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N双拳挥舞，一式「浮云去来」，两手环扣，拢成圈状，猛击$n的下颌",
        "force"  : 310,
        "attack" : 55,
        "dodge"  : 30,
        "parry"  : 67,
        "damage" : 20,
        "lvl"    : 130,
        "skill_name" : "浮云去来",
        "damage_type" : "内伤"
]),
([      "action" : "$N一式「水泡出没」，十指伸缩，虚虚实实地袭向$n的全身要穴",  
        "force"  : 340,
        "attack" : 58,
        "dodge"  : 35,
        "parry"  : 71,
        "damage" : 25,
        "lvl"    : 140,
        "skill_name" : "水泡出没",
        "damage_type" : "内伤"
]),
([      "action" : "$N双手抱拳，一式「梦里明明」，掌影翻飞，同时向$n施出九九八十一招",
        "force"  : 380,
        "attack" : 62,
        "dodge"  : 41,
        "parry"  : 72,
        "damage" : 30,
        "lvl"    : 150,
        "skill_name" : "梦里明明",
        "damage_type" : "内伤"
]),
([      "action" : "$N一式「觉后空空」，拳招若隐若现，若有若无，缓缓地拍向$n的丹田",
        "force"  : 410,
        "attack" : 69,
        "dodge"  : 40,
        "parry"  : 78,
        "damage" : 35,
        "lvl"    : 160,
        "skill_name" : "觉后空空",
        "damage_type" : "内伤"
]),
});

int valid_enable(string usage) { return usage == "hand" || usage == "parry"; }

int valid_combine(string combo) { return combo == "longzhua-gong"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练如来千叶手必须空手。\n");

        if ((int)me->query_skill("force") < 40)
                return notify_fail("你的内功火候不够，无法学如来千叶手。\n");

        if ((int)me->query("max_neili") < 200)
                return notify_fail("你的内力太弱，无法练如来千叶手。\n");

        if ((int)me->query_skill("hand", 1) < (int)me->query_skill("qianye-shou", 1))
                return notify_fail("你的基本手法水平有限，无法领会更高深的如来千叶手。\n");

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
        level = (int) me->query_skill("qianye-shou",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if (me->query_temp("weapon") ||
            me->query_temp("secondary_weapon"))
                return notify_fail("你必须空手练习！\n");

        if ((int)me->query("qi") < 75)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练如来千叶手。\n");

        me->receive_damage("qi", 68);
        me->add("neili", -64);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"qianye-shou/" + action;
}
