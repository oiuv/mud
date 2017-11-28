// longzhua-gong.c 龙爪功
// modified by Venus Oct.1997
// Updated by Doing

inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action": "在呼呼风声中，$N使一招「捕风式」，双手如钩如戢，插向$n的$l",
        "force" : 100,
        "attack": 30,
        "dodge" : 25,
        "parry" : 5,
        "damage": 10,
        "lvl"   : 0,
        "skill_name" : "捕风式" ,
        "damage_type" : "内伤"
]),
([      "action": "$N猛地向前跃出，一招「捉影式」，两腿踢出，双手抓向$n的面门",
        "force" : 110,
        "attack": 41,
        "dodge" : 30,
        "parry" : 5,
        "damage": 20,
        "lvl"   : 10,
        "skill_name" : "捉影式" ,
        "damage_type" : "内伤"
]),
([      "action": "$N双手平伸，十指微微上下抖动，一招「抚琴式」打向$n的$l",    
        "force" : 120,
        "attack": 49,
        "dodge" : 35,
        "parry" : 10,
        "damage": 25,
        "lvl"   : 20,
        "skill_name" : "抚琴式" ,
        "damage_type" : "内伤"
]),
([      "action": "$N左手上拦，右手内挥，一招「击鼓式」击向$n胸口",
        "force" : 140,
        "attack": 54,
        "dodge" : 36,
        "parry" : 11,
        "damage": 30,
        "lvl"   : 30,
        "skill_name" : "击鼓式" ,
        "damage_type" : "内伤"
]),
([      "action": "$N右手虚握，左手掌立如山，一招「批亢式」，猛地击向$n的$l",  
        "force" : 160,
        "attack": 57,
        "dodge" : 38,
        "parry" : 15,
        "damage": 40,
        "lvl"   : 40,
        "skill_name" : "批亢式" ,
        "damage_type" : "内伤"
]),
([      "action": "$N腾步上前，左手护胸，右手探出，一招「掏虚式」击向$n的裆部",
        "force" : 190,
        "attack": 60,
        "dodge" : 42,
        "parry" : 19,
        "damage": 45,
        "lvl"   : 50,
        "skill_name" : "掏虚式" ,
        "damage_type" : "内伤"
]),
([      "action": "$N双手平提胸前，左手护住面门，一招「抱残式」右手推向$n的$l",
        "force" : 220,
        "attack": 65,
        "dodge" : 47,
        "parry" : 21,
        "damage": 51,
        "lvl"   : 60,
        "skill_name" : "抱残式" ,
        "damage_type" : "内伤"
]),
([      "action": "$N两手胸前环抱，腋下含空，五指如钩，一招「守缺式」插向$n的顶门",
        "force" : 260,
        "attack": 71,
        "dodge" : 52,
        "parry" : 22,
        "damage": 54,
        "lvl"   : 80,
        "skill_name" : "守缺式" ,
        "damage_type" : "内伤"
]),
([      "action": "$N右腿斜插$n二腿之间，一招「抢珠式」，上手取目，下手反勾$n的裆部",
        "force" : 300,
        "attack": 76,
        "dodge" : 55,
        "parry" : 25,
        "damage": 57,
        "lvl"   : 100,
        "skill_name" : "抢珠式" ,
        "damage_type" : "内伤"
]),
([      "action": "$N一手虚指$n的剑诀，一招「夺剑式」，一手劈空抓向$n手中的长剑",
        "force" : 320,
        "attack": 82,
        "dodge" : 61,
        "parry" : 31,
        "damage": 62,
        "lvl"   : 120,
        "skill_name" : "夺剑式" ,
        "damage_type" : "内伤"
]),
([      "action": "$N左手指向$n胸前的五道大穴，右手斜指太阳穴，一招「拿云式」使"
                  "$n进退两难",
        "force" : 340,
        "attack": 85,
        "dodge" : 62,
        "parry" : 35,
        "damage": 65,
        "lvl"   : 140,
        "skill_name" : "拿云式" ,
        "damage_type" : "内伤"
]),
([      "action": "$N前脚着地，一手顶天成爪，一手指地，一招「追日式」劲气笼罩$n"
                  "的全身",
        "force" : 360,
        "attack": 90,
        "dodge" : 65,
        "parry" : 38,
        "damage": 70,
        "lvl"   : 160,
        "skill_name" : "追日式" ,
        "damage_type" : "内伤"
])
});

int valid_enable(string usage) { return usage == "claw" ||  usage == "parry"; }

int valid_combine(string combo) { return combo == "qianye-shou"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练龙爪功必须空手。\n");

        if ((int)me->query_skill("force") < 50)
                return notify_fail("你的内功火候不够，无法学龙爪功。\n");

        if ((int)me->query("max_neili") < 250)
                return notify_fail("你的内力太弱，无法练龙爪功。\n");

        if ((int)me->query_skill("claw", 1) < (int)me->query_skill("longzhua-gong", 1))
                return notify_fail("你的基本爪法火候水平有限，无法领会更高深的龙爪功。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action); i > 0; i--)
                if (level >= action[i - 1]["lvl"])
                        return action[i - 1]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("longzhua-gong", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
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
                return notify_fail("你的内力不够练龙爪功。\n");

        me->receive_damage("qi", 60);
        me->add("neili", -69);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"longzhua-gong/" + action;
}
