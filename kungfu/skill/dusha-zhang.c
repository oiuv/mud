// dusha-zhang.c 毒砂掌 药王谷
// Edit By Vin On 26/2/2001

#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action": "$N双手不住地忽伸忽缩，手臂关节喀喇声响，右掌一立，左掌啪的一下朝$n$l击去",
        "force" : 80,
        "attack": 28,
        "dodge" : 10,
        "parry" : 5,
        "damage": 60,
        "lvl"   : 0,
        "damage_type": "瘀伤"
]),
([      "action": "$N身形挫动，风声虎虎，接着朝$n连发八掌，一掌快似一掌，一掌猛似一掌",
        "force" : 130,
        "attack": 35,
        "dodge" : 10,
        "parry" : 10,
        "damage": 67,
        "lvl"   : 30,
        "damage_type": "瘀伤"
]),
([      "action": "$N攸地变爪为掌，身子不动，右臂陡长，潜运内力，一掌朝$n$l劈去",
        "force" : 170,
        "attack": 37,
        "dodge" : 20,
        "parry" : 25,
        "damage": 65,
        "lvl"   : 60,
        "damage_type": "瘀伤"
]),
([      "action": "$N一声怪啸，形如飘风，左掌已如风行电挚般拍向$n，掌未到，风先至，迅猛已极",
        "force" : 220,
        "attack": 42,
        "dodge" : 30,
        "parry" : 35,
        "damage": 73,
        "lvl"   : 90,
        "damage_type": "瘀伤"
]),
});

int valid_enable(string usage) { return usage == "strike" || usage == "parry"; }

int valid_combine(string combo) { return combo=="lansha-shou"; }

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int)me->query_skill("dusha-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练毒砂掌必须空手。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候不够，无法练毒砂掌。\n");

        if ((int)me->query("max_neili") < 450)
                return notify_fail("你的内力太弱，无法练毒砂掌。\n");

        if (me->query_skill("strike", 1) < me->query_skill("dusha-zhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的毒砂掌。\n");

        return 1;
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了，先休息一下吧。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练毒砂掌。\n");

        if (me->query_skill("dusha-zhang", 1) < 50)
                me->receive_damage("qi", 30);
        else
                me->receive_damage("qi", 40);

        me->add("neili", -60);
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus, int factor)
{
        int lvl;
        int flvl;

        lvl  = me->query_skill("dusha-zhang", 1);
        flvl = me->query("jiali");
        if (lvl < 80 || flvl < 10 || ! damage_bonus)
                return;

        if (flvl * 2 + random(lvl) > victim->query_skill("force") &&
           victim->affect_by("sha_poison",
                ([ "level" : flvl + random(flvl),
                   "id"    : me->query("id"),
                   "duration" : lvl / 50 + random(lvl / 20) ])))
        {
                return WHT "$n" WHT "忽然感到一股莫名的恶心，全身瘫软，嘴皮乌紫。\n" NOR;
        }
}

string perform_action_file(string action)
{
        return __DIR__"dusha-zhang/" + action;
}

