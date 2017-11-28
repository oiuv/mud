// fengyun-shou.c -风云手
// Modified by Venus Oct.1997

inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action": "$N一式「风满长空」，以掌化爪，五指如钩，直逼$n的膻中要穴",
        "force" : 90,
        "attack": 25,
        "dodge" : 5,
        "damage": 15,
        "parry" : 40,
        "lvl"   : 0,
        "skill_name" : "风满长空",
        "damage_type" : "瘀伤"
]),
([      "action": "$N左手虚晃，一式「烈火腾云」，右手上下直击，反扣$n的肩井大穴",
        "force" : 120,
        "attack": 32,
        "dodge" : 10,
        "damage": 20,
        "parry" : 42,
        "lvl"   : 30,
        "skill_name" : "烈火腾云",
        "damage_type" : "瘀伤"
]),
([      "action": "$N使一式「草深雾泽」，掌指齐出，拍拿并施，拿向$n的三路要害",
        "force" : 150,
        "attack": 41,
        "dodge" : 15,
        "parry" : 45,
        "damage": 30,
        "lvl"   : 60,
        "skill_name" : "草深雾泽",
        "damage_type" : "瘀伤"
]),
([      "action": "$N左手鹰抓，右手蛇举，一式「天目昭辉」疾扣$n的中节大脉",
        "force" : 180,
        "attack": 45,
        "dodge" : 20,
        "parry" : 46,
        "damage": 40,
        "lvl"   : 90,
        "skill_name" : "天目昭辉",
        "damage_type" : "瘀伤"
]),
([      "action": "$N使一式「雷震四方」，四面八方出现无数掌影，一爪突出，抓向$n的胸口",
        "force" : 220,
        "attack": 53,
        "dodge" : 25,
        "parry" : 54,
        "damage": 50,
        "lvl" : 120,
        "skill_name" : "雷震四方",
        "damage_type" : "内伤"
]),
([      "action": "$N两手环扣，全身关节啪啪作响，一式「水到渠成」，击向$n的$l",
        "force" : 270,
        "attack": 58,
        "dodge" : 30,
        "parry" : 58,
        "damage": 60,
        "lvl" : 140,
        "skill_name" : "水到渠成",
        "damage_type" : "内伤"
]),
([      "action": "$N一式「山高林密」，十指齐伸，遮天蔽日般地笼罩$n的全身要穴",
        "force" : 330,
        "attack": 70,
        "dodge" : 35,
        "parry" : 62,
        "damage": 70,
        "lvl" : 160,
        "skill_name" : "山高林密",
        "damage_type" : "内伤"
]),
([      "action": "$N岳立霆峙，一式「地老天荒」，在一阵暴雷声中，双手同时拍向$n"
                  "的七道死穴",
        "force" : 360,
        "attack": 77,
        "dodge" : 50,
        "parry" : 65,
        "damage": 80,
        "lvl" : 180,
        "skill_name" : "地老天荒",
        "damage_type" : "内伤"
])
});

int valid_enable(string usage) { return usage == "hand" || usage == "parry"; }

int valid_combine(string combo) { return combo == "yingzhua-gong"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练风云手必须空手。\n");

        if ((int)me->query_skill("force") < 40)
                return notify_fail("你的内功火候不够，无法学风云手。\n");

        if ((int)me->query("max_neili") < 200)
                return notify_fail("你的内力太弱，无法练风云手。\n");

        if ((int)me->query_skill("hand", 1) < (int)me->query_skill("fengyun-shou", 1))
                return notify_fail("你的基本手法水平有限，无法领会更高深的风云手。\n");

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
        level = (int) me->query_skill("fengyun-shou",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if (me->query_temp("weapon") ||
            me->query_temp("secondary_weapon"))
                return notify_fail("你必须空手练习！\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练风云手。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -69);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"fengyun-shou/" + action;
}
