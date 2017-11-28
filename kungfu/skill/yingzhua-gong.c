// yingzhua-gong.c -鹰爪功
// modified by Venus Oct.1997

inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action": "$N全身拔地而起，半空中一个筋斗，一式「苍鹰袭兔」，迅猛地抓向$n的$l",
        "force" : 100,
        "attack": 20,
        "dodge" : 5,
        "parry" : 15,
        "damage": 10,
        "lvl" : 0,
        "skills_name" : "苍鹰袭兔",
        "damage_type" : "内伤"
]),
([      "action": "$N单腿直立，双臂平伸，一式「雄鹰展翅」，双爪一前一后拢向$n的$l",
        "force" : 120,
        "attack": 40,
        "dodge" : 10,
        "parry" : 22,
        "damage": 15,
        "lvl" : 30,
        "skills_name" : "雄鹰展翅",
        "damage_type" : "内伤"
]),
([      "action": "$N一式「拔翅横飞」，全身向斜里平飞，右腿一绷，双爪搭向$n的肩头",
        "force" : 150,
        "attack": 50,
        "dodge" : 10,
        "parry" : 28,
        "damage": 20,
        "lvl" : 60,
        "skills_name" : "拔翅横飞",
        "damage_type" : "内伤"
]),
([      "action": "$N双爪交错上举，使一式「迎风振翼」，一拔身，分别袭向$n左右腋空门",
        "force" : 180,
        "attack": 55,
        "dodge" : 15,
        "parry" : 35,
        "damage": 35,
        "lvl" : 80,
        "skills_name" : "迎风振翼",
        "damage_type" : "内伤"
]),
([      "action": "$N全身滚动上前，一式「飞龙献爪」，右爪突出，鬼魅般抓向$n的胸口",
        "force" : 220,
        "attack": 65,
        "dodge" : 20,
        "parry" : 38,
        "damage": 45,
        "lvl" : 100,
        "skills_name" : "飞龙献爪",
        "damage_type" : "内伤"
]),
([      "action": "$N伏地滑行，一式「拨云瞻日」，上手袭向膻中大穴，下手反抓$n的裆部",
        "force" : 250,
        "attack": 60,
        "dodge" : 25,
        "parry" : 45,
        "damage": 50,
        "lvl" : 120,
        "skills_name" : "拨云瞻日",
        "damage_type" : "内伤"
]),
([      "action": "$N左右手掌爪互逆，一式「搏击长空」，无数道劲气破空而出，迅疾无比地击向$n",
        "force" : 280,
        "attack": 75,
        "dodge" : 25,
        "parry" : 52,
        "damage": 55,
        "lvl" : 140,
        "skills_name" : "凶鹰袭兔",
        "damage_type" : "内伤"
]),
([      "action": "$N腾空高飞三丈，一式「鹰扬万里」，天空中顿时显出一个巨灵爪影，缓缓罩向$n",
        "force" : 310,
        "attack": 80,
        "dodge" : 40,
        "parry" : 60,
        "damage": 60,
        "lvl" : 160,
        "skills_name" : "凶鹰袭兔",
        "damage_type" : "内伤"
])
});

int valid_enable(string usage) { return usage == "claw" || usage == "parry"; }

int valid_combine(string combo) { return combo == "fengyun-shou"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练鹰爪功必须空手。\n");

        if ((int)me->query_skill("force") < 50)
                return notify_fail("你的内功火候不够，无法学鹰爪功。\n");

        if ((int)me->query("max_neili") < 250)
                return notify_fail("你的内力太弱，无法练鹰爪功。\n");

        if ((int)me->query_skill("claw", 1) < (int)me->query_skill("yingzhua-gong", 1))
                return notify_fail("你的基本抓法火候水平有限，无法领会更高深的鹰爪功。\n");

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
        level = (int) me->query_skill("yingzhua-gong",1);
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
                return notify_fail("你的内力不够练鹰爪功。\n");

        me->receive_damage("qi", 60);
        me->add("neili", -67);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"yingzhua-gong/" + action;
}
