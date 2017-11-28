inherit SKILL;

mapping *action = ({
([      "action" : "$N身形急晃，一跃而至$n跟前，右掌带着切骨寒气砍向$n的$l",
        "force" : 160,
        "attack": 25,
        "dodge" : 15,
        "parry" : 15,
        "damage": 10,
        "lvl"   : 0,
        "skill_name" : "切骨寒气",
        "damage_type" : "割伤"
]),
([      "action" : "$N飞身跃起，双掌至上而下斜砍而出，顿时万千道阴风寒劲从四面八方席卷$n",
        "force" : 220,
        "attack": 40,
        "dodge" : 20,
        "parry" : 15,
        "damage": 20,
        "lvl"   : 30,
        "skill_name" : "阴风寒劲",
        "damage_type" : "割伤"
]),
([      "action" : "$N平掌为刀，斜斜砍出，掌劲幻出一片片切骨寒气如飓风般裹向$n的全身",
        "force" : 280,
        "attack": 50,
        "dodge" : 20,
        "parry" : 25,
        "damage": 28,
        "lvl"   : 60,
        "skill_name" : "切骨寒气",
        "damage_type" : "割伤"
]),
([      "action" : "$N反转右掌对准自己护住全身，突然一个筋斗翻至$n面前，左掌横向$n拦腰砍去",
        "force" : 360,
        "attack": 60,
        "dodge" : 80,
        "parry" : 60,
        "damage": 35,
        "lvl"   : 80,
        "skill_name" : "反转右掌",
        "damage_type" : "割伤"
]),
([      "action" : "$N右掌后撤，手腕一翻，猛地挥掌砍出，幻出一道寒芒直斩向$n的$l",
        "force" : 420,
        "attack": 110,
        "dodge" : 45,
        "parry" : 40,
        "damage": 50,
        "lvl"   : 100,
        "skill_name" : "寒芒直斩",
        "damage_type" : "割伤"
]),
});

int valid_enable(string usage) { return usage=="strike" || usage=="parry"; }

int valid_combine(string combo) { return combo=="tougu-zhen"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练阴风刀必须空手。\n");

        if ((int)me->query_skill("force") < 200)
                return notify_fail("你的内功火候不够，无法练习阴风刀。\n");

        if ((int)me->query("max_neili") < 1400)
                return notify_fail("你的内力太弱，无法练习阴风刀。\n");

        if ((int)me->query_skill("strike", 1) < 100)
                return notify_fail("你的基本掌法火候不够，无法练习阴风刀。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("yinfeng-dao", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的阴风刀。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if(level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level   = (int) me->query_skill("yinfeng-dao",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够练阴风刀。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -80);
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus, int factor)
{
        int lvl;
        int flvl;

        lvl  = me->query_skill("yinfeng-dao", 1);
        flvl = me->query("jiali");
        if (lvl < 80 || flvl < 10 || ! damage_bonus)
                return;

        if (flvl * 2 + random(lvl) > victim->query_skill("force") &&
            victim->affect_by("yinfeng_dao",
                              ([ "level" : flvl + random(flvl),
                                 "id"    : me->query("id"),
                                 "duration" : lvl / 100 + random(lvl / 10) ])))
        {
                return "$n只感一阵刮骨之痛，看来是受了对方阴风刀内劲的干扰。\n";
        }
}

string perform_action_file(string action)
{
        return __DIR__"yinfeng-dao/" + action;
}

