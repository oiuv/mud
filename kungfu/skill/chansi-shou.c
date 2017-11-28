inherit SKILL;

mapping *action = ({
([      "action": "$N以掌化爪，五指如钩，直逼$n的膻中要穴",
        "force" : 90,
        "attack": 25,
        "dodge" : 5,
        "damage": 15,
        "parry" : 40,
        "lvl"   : 0,
        "damage_type" : "瘀伤"
]),
([      "action": "$N左手虚晃，右手上下直击，反扣$n的肩井大穴",
        "force" : 120,
        "attack": 32,
        "dodge" : 10,
        "damage": 20,
        "parry" : 42,
        "lvl"   : 30,
        "damage_type" : "瘀伤"
]),
([      "action": "$N掌指齐出，拍拿并施，拿向$n的三路要害",
        "force" : 150,
        "attack": 41,
        "dodge" : 15,
        "parry" : 45,
        "damage": 30,
        "lvl"   : 60,
        "damage_type" : "瘀伤"
]),
([      "action": "$N左手鹰抓，右手蛇举，疾扣$n的中节大脉",
        "force" : 180,
        "attack": 45,
        "dodge" : 20,
        "parry" : 46,
        "damage": 40,
        "lvl"   : 90,
        "damage_type" : "瘀伤"
]),
([      "action": "$N上前一步，四面八方出现无数掌影，一爪抓向$n的胸口",
        "force" : 220,
        "attack": 53,
        "dodge" : 25,
        "parry" : 54,
        "damage": 50,
        "lvl" : 120,
        "damage_type" : "内伤"
]),
([      "action": "$N两手环扣，全身关节啪啪作响，击向$n的$l",
        "force" : 270,
        "attack": 58,
        "dodge" : 30,
        "parry" : 58,
        "damage": 60,
        "lvl" : 140,
        "damage_type" : "内伤"
]),
([      "action": "$N十指齐伸，遮天蔽日般地笼罩$n的全身要穴",
        "force" : 330,
        "attack": 70,
        "dodge" : 35,
        "parry" : 62,
        "damage": 70,
        "lvl" : 160,
        "damage_type" : "内伤"
]),
([      "action": "$N岳立霆峙，在一阵暴雷声中，双手同时拍向$n的全身各处",
        "force" : 360,
        "attack": 77,
        "dodge" : 50,
        "parry" : 65,
        "damage": 80,
        "lvl" : 180,
        "damage_type" : "内伤"
])
});

int valid_enable(string usage)
{
        return usage == "hand" || usage == "parry";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练缠丝擒拿手必须空手。\n");

        if ((int)me->query_skill("force") < 60)
                return notify_fail("你的内功火候不够，无法学缠丝擒拿手。\n");

        if ((int)me->query("max_neili") < 500)
                return notify_fail("你的内力修为太弱，无法练缠丝擒拿手。\n");

        if ((int)me->query_skill("hand", 1) < 80)
                return notify_fail("你的基本手法不够，无法练缠丝擒拿手。\n");

        if ((int)me->query_skill("hand", 1) < (int)me->query_skill("chansi-shou", 1))
                return notify_fail("你的基本手法水平有限，无法领会更高深的缠丝擒拿手。\n");

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
        level = (int) me->query_skill("chansi-shou", 1);

        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        if (me->query_temp("weapon") ||
            me->query_temp("secondary_weapon"))
                return notify_fail("你必须空手练习！\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练缠丝擒拿手。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -69);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"chansi-shou/" + action;
}
