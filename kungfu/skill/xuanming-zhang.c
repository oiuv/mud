
// create by rcwiz 2003 for yanhuang online 

inherit SKILL;
#include <ansi.h>

mapping *action = ({
([      "action" : "$N使出一招「雪海茫茫」，双掌陡然攻出，带着丝丝阴风击向$n的$l",
        "force" : 100,
        "attack": 25,
        "dodge" : 15,
        "parry" : 20,
        "damage": 10,
        "lvl"   : 0,
        "skill_name" : "雪海茫茫",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N使出一招「幽冥寒山」，左掌护胸，右掌掌心带着极寒之气拍向$n的$l",
        "force" : 130,
        "attack": 30,
        "dodge" : 10,
        "parry" : 15,
        "damage": 20,
        "lvl"   : 30,
        "skill_name" : "幽冥寒山",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N怪叫一声，一招「阴风怒号」，双掌铺天盖地般拍向$n的$l",
        "force" : 160,
        "attack": 45,
        "dodge" : 20,
        "parry" : 20,
        "damage": 25,
        "lvl"   : 60,
        "skill_name" : "阴风怒号",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一照「凄雨冷风」，双掌拍出满天阴风，忽然右掌悄无声息的拍向$n的$l",
        "force" : 180,
        "attack": 50,
        "dodge" : 20,
        "parry" : 30,
        "damage": 30,
        "lvl"   : 80,
        "skill_name" : "凄雨冷风",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N身形一跃，一招「亡命冰原」，左掌快若疾电般击向$n的$l",
        "force" : 210,
        "attack": 65,
        "dodge" : 25,
        "parry" : 20,
        "damage": 35,
        "lvl"   : 100,
        "skill_name" : "亡命冰原",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N阴笑一声，一招「孤山绝寒」，双掌一错，右掌忽然暴长数尺击向$n的$l",
        "force" : 280,
        "attack": 95,
        "dodge" : 25,
        "parry" : 25,
        "damage": 55,
        "lvl"   : 120,
        "skill_name" : "孤山绝寒",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一招「雪原孤月」，身形急晃，一跃而至$n跟前，右掌带着冲天寒气击向$n的$l",
        "force" : 320,
        "attack": 110,
        "dodge" : 30,
        "parry" : 30,
        "damage": 70,
        "lvl"   : 140,
        "skill_name" : "雪原孤月",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N仰天长啸，一招「魂葬玄冥」，双掌掌风似千古不化的寒冰般扑向$n的$l",
        "force" : 360,
        "attack": 135,
        "dodge" : 30,
        "parry" : 35,
        "damage": 95,
        "lvl"   : 150,
        "skill_name" : "魂葬玄冥",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N身法陡然一变，使出一式「幽玄冥冥」，掌影千变万幻，令$n无法躲闪",
        "force" : 420,
        "attack": 150,
        "dodge" : 30,
        "parry" : 75,
        "damage": 110,
        "lvl"   : 160,
        "skill_name" : "幽玄冥冥",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N仰天一声狂啸，一式「冰坚地狱」，双掌携带着万古冰坚直直贯向$n",
        "force" : 450,
        "attack": 185,
        "dodge" : 40,
        "parry" : 80,
        "damage": 160,
        "lvl"   : 180,
        "skill_name" : "冰坚地狱",
        "damage_type" : "内伤"
])
});

int valid_enable(string usage)
{
        return usage=="strike" || usage=="parry";
}

int valid_learn(object me)
{
        if (me->query("character") == "光明磊落")
                return notify_fail("你心中暗想：我为人光明磊落，岂能学习这种阴毒武功？\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练玄冥神掌必须空手。\n");

        if ((int)me->query_skill("force") < 200)
                return notify_fail("你的内功火候不够，无法练习玄冥神掌。\n");

        if (me->query("con") < 34)
                return notify_fail("你先天根骨不足，无法修炼玄冥神掌。\n");

        if ((int)me->query("max_neili") < 2000)
                return notify_fail("你的内力太弱，无法练习玄冥神掌。\n");

        if ((int)me->query_skill("strike", 1) < 100)
                return notify_fail("你的基本掌法火候不够，无法练玄冥神掌。\n");

        if ((int)me->query_skill("xuanming-shengong", 1) < (int)me->query_skill("xuanming-zhang", 1))
                return notify_fail("你的玄冥神功水平有限，无法领会更高深的玄冥神掌。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("xuanming-zhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的玄冥神掌。\n");

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
        level   = (int) me->query_skill("xuanming-zhang",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if (me->query("con") < 34)
                return notify_fail("你先天根骨不足，无法修炼玄冥神掌。\n");

        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够练玄冥神掌。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -80);
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus, int factor)
{
        int lvl;
        int flvl;

        lvl  = me->query_skill("xuanming-zhang", 1);
        flvl = me->query("jiali");
        if (lvl < 240 || ! damage_bonus ||
            me->query_skill_mapped("force") != "xuanming-shengong" ||
            me->query("neili") < 300)
                return;

        if (flvl * 5 / 2 + random(lvl) > victim->query_skill("force") &&
            victim->affect_by("xuanming_poison",
                              ([ "level" : flvl * 3,
                                 "id"    : me->query("id"),
                                 "duration" : lvl / 40 + random(lvl / 20) ])))
        {
                me->add("neili", -100);
                return HIW "$n" HIW "忽然感到一股莫名的恶心，阴寒的冷气攻心，全身瘫软，嘴皮乌紫。\n" NOR;
        }
}

string perform_action_file(string action)
{
        return __DIR__"xuanming-zhang/" + action;
}

