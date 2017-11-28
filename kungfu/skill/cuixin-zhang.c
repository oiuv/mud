//cuixin-zhang.c 《九阴真经》——九阴神功——催心掌
//Edit By Vin On 13/2/2001

#include <ansi.h>

inherit SKILL;

mapping *action = ({
([  "action": "$N使出一招「百花凋零」，运掌如飞，招招直打$n的$l",
    "force" : 220,
    "attack": 25,
    "dodge" : 10,
    "parry" : 16,
    "damage": 10,
    "lvl"   : 0,
    "skill_name" : "百花凋零" ,
    "damage_type" : "瘀伤"
]),
([  "action": "$N使出一招「万木皆枯」，双掌急运内力，带着凛冽的掌风直拍$n的$l",
    "force" : 280,
    "attack": 55,
    "dodge" : 15,
    "parry" : 19,
    "damage": 25,
    "lvl"   : 30,
    "skill_name" : "万木皆枯" ,
    "damage_type" : "瘀伤"
]),
([  "action": "$N飞身一跃而起，一声怪叫，一招「魂飞魄散」，双掌铺天盖地般拍向$n",
    "force" : 340,
    "attack": 67,
    "dodge" : 20,
    "parry" : 25,
    "damage": 35,
    "lvl"   : 60,
    "skill_name"  : "魂飞魄散" ,
    "damage_type" : "瘀伤"
]),
([  "action": "$N惨然一声长啸，一招「收魂摄魄」，双掌猛然击下，直扑$n的要脉",
    "force" : 440,
    "attack": 85,
    "dodge" : 20,
    "parry" : 38,
    "damage": 60,
    "lvl"   : 90,
    "skill_name" : "收魂摄魄" ,
    "damage_type" : "瘀伤"
]),
([  "action": "$N大叫一声，骨骼一阵暴响，双臂忽然暴长数尺，一招「六阴追魂」直直攻向$n的$l",
    "force" : 470,
    "attack": 90,
    "dodge" : 40,
    "parry" : 43,
    "damage": 65,
    "lvl"   : 120,
    "skill_name" : "六阴追魂" ,
    "damage_type" : "瘀伤"
]),
([  "action": "$N一招「裂骨催心」，双掌缤纷拍出，化出满天掌影，陡然间一掌已迅捷无比的拍向$n",
    "force" : 480,
    "attack": 126,
    "dodge" : 40,
    "parry" : 55,
    "damage": 80,
    "lvl"   : 150,
    "skill_name" : "裂骨催心" ,
    "damage_type" : "瘀伤"
]),
});

//string main_skill() { return "jiuyin-shengong"; }

int valid_enable(string usage) { return  usage == "strike" || usage == "unarmed" || usage == "parry"; }

//int valid_combine(string combo) { return combo=="jiuyin-baiguzhao" || combo=="dafumo-quan"; }
int valid_combine(string combo) { return combo=="jiuyin-baiguzhao"; }

int valid_learn(object me)
{

        //if ((int)me->query_skill("jiuyin-shengong", 1))
                //return notify_fail("你已将九阴真经上的武功全部融会贯通，不必再分开学习了。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
            return notify_fail("练催心掌必须空手。\n");

        if ((int)me->query_skill("force") < 100)
            return notify_fail("你的内功太差，无法练习催心掌。\n");

        if ((int)me->query("max_neili") < 1200)
            return notify_fail("你的内力修为太浅，无法练习催心掌。\n");

        if ((int)me->query_skill("unarmed", 1) < 100)
                return notify_fail("你的基本拳脚有限，无法体会催心掌的要诣。\n");

        if ((int)me->query_skill("unarmed", 1) < (int)me->query_skill("cuixin-zhang", 1))
                return notify_fail("你的基本拳脚水平有限，无法领会更高深的催心掌。\n");

        if ((int)me->query_skill("strike", 1) < 100)
            return notify_fail("你的基本掌法太差，无法领会催心掌。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("cuixin-zhang", 1))
            return notify_fail("你的基本掌法火候不够，无法领会更高深的催心掌。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action); i > 0; i--)
                if (level >= action[i-1]["lvl"])
                        return action[i-1]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("cuixin-zhang",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 5, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query_skill("jiuyin-shengong", 1))
                return notify_fail("你已将九阴真经上的武功全部融会贯通，不必再分开练习了。\n");

        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 350)
                return notify_fail("你的内力不够。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -150);
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus, int factor)
{
        int lvl;
        int flvl;

        lvl  = me->query_skill("cuixin-zhang", 1);
        flvl = me->query("jiali");
        if (lvl < 80 || flvl < 10 || ! damage_bonus)
                return;

        if (flvl * 2 + random(lvl) > victim->query_skill("force") &&
            victim->affect_by("cuixin_zhang",
                              ([ "level" : flvl + random(flvl),
                                 "id"    : me->query("id"),
                                 "duration" : lvl / 100 + random(lvl / 10) ])))
        {
                return HIR "只听$n" HIR "闷哼了一声，看来是受到了催心掌掌劲的干扰！\n" NOR;
        }
}

string perform_action_file(string action)
{
        return __DIR__"cuixin-zhang/" + action;
}

