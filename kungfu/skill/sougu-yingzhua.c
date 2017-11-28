// 搜骨鹰爪功
// modified by Rcwiz 2002

inherit SKILL;

mapping *action = ({
([      "action": "$N全身拔地而起，半空中一个筋斗，一式「鹰飞式」，迅猛地抓向$n的$l",
        "force" : 100,
        "attack": 20,
        "dodge" : 5,
        "parry" : 15,
        "damage": 10,
        "lvl" : 0,
        "skills_name" : "鹰飞式",
        "damage_type" : "内伤"
]),
([      "action": "$N单腿直立，双臂平伸，一式「雄鹰式」，双爪一前一后拢向$n的$l",
        "force" : 120,
        "attack": 40,
        "dodge" : 10,
        "parry" : 22,
        "damage": 15,
        "lvl" : 30,
        "skills_name" : "雄鹰式",
        "damage_type" : "内伤"
]),
([      "action": "$N一式「锁骨爪」，全身向斜里平飞，右腿一绷，双爪搭向$n的肩头",
        "force" : 150,
        "attack": 50,
        "dodge" : 10,
        "parry" : 28,
        "damage": 20,
        "lvl" : 60,
        "skills_name" : "锁骨爪",
        "damage_type" : "内伤"
]),
([      "action": "$N双爪交错上举，使一式「夺魂勾」，一拔身，分别袭向$n左右腋空门",
        "force" : 180,
        "attack": 55,
        "dodge" : 15,
        "parry" : 35,
        "damage": 35,
        "lvl" : 80,
        "skills_name" : "夺魂勾",
        "damage_type" : "内伤"
]),
([      "action": "$N全身滚动上前，一式「神鹰式」，右爪突出，鬼魅般抓向$n的胸口",
        "force" : 220,
        "attack": 65,
        "dodge" : 20,
        "parry" : 38,
        "damage": 45,
        "lvl" : 100,
        "skills_name" : "神鹰式",
        "damage_type" : "内伤"
]),
([      "action": "$N伏地滑行，一式「血鹰爪」，上手袭向膻中大穴，下手反抓$n的裆部",
        "force" : 240,
        "attack": 60,
        "dodge" : 25,
        "parry" : 45,
        "damage": 60,
        "lvl" : 120,
        "skills_name" : "血鹰爪",
        "damage_type" : "内伤"
]),
});

int valid_enable(string usage) { return usage == "claw" || usage == "parry"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练搜骨鹰爪功必须空手。\n");

        if ((int)me->query_skill("force") < 50)
                return notify_fail("你的内功火候不够，无法学搜骨鹰爪功。\n");

        if ((int)me->query("max_neili") < 250)
                return notify_fail("你的内力太弱，无法练搜骨鹰爪功。\n");

        if ((int)me->query_skill("claw", 1) < (int)me->query_skill("sougu-yingzhua", 1))
                return notify_fail("你的基本抓法火候水平有限，无法领会更高深的搜骨鹰爪功。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("sougu-yingzhua",1);
        for(i = sizeof(action); i > 0; i--)
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

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够搜骨鹰爪功。\n");

        me->receive_damage("qi", 60);
        me->add("neili", -67);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"sougu-yingzhua/" + action;
}
