#include <ansi.h>
inherit FORCE;

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("hamagong", 1);
        return lvl * lvl * 15 * 18 / 100 / 200;
}

int valid_force(string force)
{
        return force == "baituo-xinfa";
}

mapping *action = ({
([      "action" : "$N忽而倒竖，一手撑住地面，身子横挺，另一掌向$n的胸口拍去",
        "dodge"  : 35,
        "force"  : 310,
        "attack" : 103,
        "parry"  : 21,
        "damage" : 58,
        "lvl"    : 0,
        "damage_type": "震伤" 
]), 
([      "action" : "$N双腿微曲，右掌平伸，左掌运起蛤蟆功劲力，呼的一声推向$n",
        "dodge"  : 50,
        "force"  : 332,
        "attack" : 112,
        "parry"  : 37,
        "damage" : 61,
        "lvl"    : 180,
        "damage_type": "震伤"
]), 
([      "action" : "$N闭眼逼住呼吸，猛跃而起，眼睛也不及睁开，便向$n推了出去",
        "dodge"  : 67,
        "force"  : 360,
        "attack" : 122,
        "parry"  : 53,
        "damage" : 72,
        "lvl"    : 220,
        "damage_type": "震伤"
]),
([      "action" : "$N脚步摇幌，忽然双腿一登，口中阁的一声叫喝，向$n猛然推出",
        "dodge"  : 75,
        "force"  : 410,
        "attack" : 143,
        "parry"  : 67,
        "damage" : 81,
        "lvl"    : 240,
        "damage_type": "震伤"
]), 
});

int valid_enable(string usage)
{ 
        int lvl = (int)this_player()->query_skill("hamagong", 1);

        if (lvl >= 180)    
                return usage == "force" || usage == "unarmed" || usage == "parry";
        else
                return usage == "force";
       
}

int valid_learn(object me)
{
        if (me->query("character") == "光明磊落"
           || me->query("character") == "狡黠多变")
                return notify_fail("你心中暗道：这蛤蟆功阴毒异常，估计会伤及自"
                                   "身，还是别练为妙。\n");

        if ((int)me->query("con") < 32)
               return notify_fail("你先天根骨孱弱，无法修炼蛤蟆功。\n");

        if ((int)me->query("dex") < 32)
                return notify_fail("你先天身法太差，无法修炼蛤蟆功。\n");

        if (me->query("gender") == "无性" && me->query("hamagong", 1) > 49)
                return notify_fail("你无根无性，阴阳不调，难以领会高深的蛤蟆功。\n");

        if ((int)me->query_skill("force", 1) < 50
         || (int)me->query_skill("force", 1) < (int)me->query_skill("hamagong", 1) )
                return notify_fail("你的基本内功火候不足，不能学蛤蟆功。\n");

        if ((int)me->query_skill("unarmed", 1) < 150)
                return notify_fail("你的基本拳脚火候不足，难以领会蛤蟆功。\n");

        if ((int)me->query_skill("poison", 1) < 150)
                return notify_fail("你的基本毒技火候不足，难以领会蛤蟆功。\n");
        
        if ((int)me->query("max_neili", 1) < 2500)
                return notify_fail("你现在的内力修为不足，难以领会蛤蟆功。\n");

        return ::valid_learn(me);
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("hamagong", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 5, level / 5)];
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int lvl;

        lvl = me->query_skill("hamagong", 1);

        if (damage_bonus < 150
           || lvl < 180
           || me->query("neili") < 300
           || me->query_temp("weapon")
           || me->query_temp("secondary_weapon")
           || me->query_skill_mapped("force") != "hamagong"
           || me->query_skill_mapped("unarmed") != "hamagong"
           || me->query_skill_prepared("unarmed") != "hamagong")
                return 0;

        if (damage_bonus / 6 > victim->query_con())
        {
                me->add("neili", -30);
                victim->receive_wound("qi", (damage_bonus - 90) / 3, me);
                return HIW "$n" HIW "硬承下$N" HIW "一掌，霎时全"
                       "身一颤，经脉受震，喷出一口鲜血！\n" NOR;
        }
}

int practice_skill(object me)
{
        return notify_fail("蛤蟆功只能用学(learn)的来增加熟练度。\n");
}

string perform_action_file(string action)
{
        return __DIR__"hamagong/perform/" + action;
}

string exert_function_file(string action)
{
        return __DIR__"hamagong/exert/" + action;
}
