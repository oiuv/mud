inherit SKILL;

mapping *action = ({
([      "action" : "$N将内劲贯住指尖，携带着丝丝阴风一击凌空射向$n的$l",
        "force" : 140,
        "attack": 25,
        "dodge" : 15,
        "parry" : 15,
        "damage": 10,
        "lvl"   : 0,
        "skill_name" : "丝丝阴风",
        "damage_type" : "刺伤"
]),
([      "action" : "$N表情麻木，陡的跃身而起，右手食指带着极寒之气直射$n的$l",
        "force" : 180,
        "attack": 40,
        "dodge" : 20,
        "parry" : 15,
        "damage": 25,
        "lvl"   : 30,
        "skill_name" : "极寒之气",
        "damage_type" : "刺伤"
]),
([      "action" : "$N怪叫一声，顿在半空翻个筋斗，将要落下之时，突然对准$n的$l处“飕”的一指射出",
        "force" : 220,
        "attack": 50,
        "dodge" : 20,
        "parry" : 25,
        "damage": 38,
        "lvl"   : 60,
        "skill_name" : "一指射出",
        "damage_type" : "刺伤"
]),
([      "action" : "$N提气游走，不露身色绕至$n身后，猛的对准$n$l一指射出，$n刚要回挡，却发"
                   "\n现此招乃是需招，$N至寒的一指已点向$n的后心",
        "force" : 280,
        "attack": 80,
        "dodge" : 80,
        "parry" : 60,
        "damage": 55,
        "lvl"   : 80,
        "skill_name" : "乃是需招",
        "damage_type" : "刺伤"
]),
([      "action" : "$N向后疾退数尺，猛的又奔至$n跟前，左手食指快若疾电般点向$n的$l",
        "force" : 360,
        "attack": 140,
        "dodge" : 45,
        "parry" : 40,
        "damage": 80,
        "lvl"   : 100,
        "skill_name" : "亡命冰原",
        "damage_type" : "刺伤"
]),
});

int valid_enable(string usage) { return usage=="finger" || usage=="parry"; }

int valid_combine(string combo) { return combo=="yinfeng-dao"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练透骨针必须空手。\n");

        if ((int)me->query_skill("force") < 200)
                return notify_fail("你的内功火候不够，无法练习透骨针。\n");

        if ((int)me->query("max_neili") < 1400)
                return notify_fail("你的内力太弱，无法练习透骨针。\n");

        if ((int)me->query_skill("finger", 1) < 100)
                return notify_fail("你的基本指法火候不够，无法练习透骨针。\n");

        if ((int)me->query_skill("finger", 1) < (int)me->query_skill("tougu-zhen", 1))
                return notify_fail("你的基本指法水平有限，无法领会更高深的透骨针。\n");

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
        level   = (int) me->query_skill("tougu-zhen",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够练透骨针。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -80);
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus, int factor)
{
        int lvl;
        int flvl;

        lvl  = me->query_skill("tougu-zhen", 1);
        flvl = me->query("jiali");
        if (lvl < 80 || flvl < 10 || ! damage_bonus)
                return;

        if (flvl * 2 + random(lvl) > victim->query_skill("force") &&
            victim->affect_by("tougu_zhen",
                              ([ "level" : flvl + random(flvl),
                                 "id"    : me->query("id"),
                                 "duration" : lvl / 100 + random(lvl / 10) ])))
        {
                return "$n只感到从伤口处传来一阵切骨之痛，看来是受了对方透骨针内劲的干扰。\n";
        }
}

string perform_action_file(string action)
{
        return __DIR__"tougu-zhen/" + action;
}

