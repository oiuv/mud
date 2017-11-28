#include <ansi.h>;
inherit SKILL;

mapping *action = ({
([      "action" : "$N立定当地，手中的$w在面前移动，突然一招「春雷炸空」向$n劈去",
        "skill_name" : "春雷炸空",
        "force" : 320,
        "attack": 27,
        "dodge" : -30,
        "parry" : -34,
        "lvl"   : 0,
        "damage": 62,
        "damage_type" : "挫伤",
]),
([      "action" : "$N渊停岳峙，身形猛的升起五丈，一招「飞惊落虹」寒光乍现般向$n劈去",
        "skill_name" : "飞惊落虹",
        "force" : 460,
        "attack": 38,
        "dodge" : -27,
        "parry" : -45,
        "lvl"   : 40,
        "damage": 66,
        "damage_type" : "挫伤",
]),
([      "action" : "$N突然暴喝一声，手里的$w一挫，一招「苍穹开破」猛的劈向$n而去",
        "skill_name" : "苍穹开破",
        "force" : 500,
        "attack": 43,
        "dodge" : -25,
        "parry" : -47,
        "lvl"   : 80,
        "damage": 70,
        "damage_type" : "挫伤",
]),
([      "action" : "$N斜移两步，手中$w发出阵阵寒光，陡然间一招「破碎虚空」劈向$n",
        "skill_name" : "破碎虚空",
        "force" : 520,
        "attack": 51,
        "dodge" : -45,
        "parry" : -50,
        "lvl"   : 120,
        "damage": 75,
        "damage_type" : "挫伤",
]),
([      "action" : "$N双手一顿，一招「火雨流星」，手中的$w以极快的速度向$n连劈数下",
        "skill_name" : "火雨流星",
        "force" : 530,
        "attack": 55,
        "dodge" : -20,
        "parry" : -25,
        "lvl"   : 160,
        "damage": 80,
        "damage_type" : "挫伤",
]),
([      "action" : "$N将$w舞得尤如万条金龙，使人不敢靠近，猛的一招「魂冥千屠」向$n劈去",
        "skill_name" : "魂冥千屠",
        "force" : 550,
        "attack": 65,
        "dodge" : -40,
        "parry" : -35,
        "lvl"   : 180,
        "damage": 98,
        "damage_type" : "挫伤",
]),
([      "action" : "$N手中的$w“铛”的一声，斧锋侧翻，光铧骤闪，一招「绝寰电闪」劈向$n",
        "skill_name" : "绝寰电闪",
        "force" : 570,
        "attack": 84,
        "dodge" : -62,
        "parry" : -33,
        "lvl"   : 220,
        "damage": 104,
        "damage_type" : "挫伤",
]),
([      "action" : "$N斧尖指天，斧锋骤颤，陡然施出一招「泣血惊天」，数十道冷光劈向$n",
        "skill_name" : "泣血惊天",
        "force" : 580,
        "attack": 97,
        "dodge" : -62,
        "parry" : -33,
        "lvl"   : 260,
        "damage": 113,
        "damage_type" : "挫伤",
]),
([      "action" : "$N突然一招「创刃无还」，手中的$w像是穹苍中的一道闪电般劈向$n",
        "skill_name" : "创刃无还",
        "force" : 610,
        "attack": 109,
        "dodge" : -62,
        "parry" : -33,
        "lvl"   : 280,
        "damage": 121,
        "damage_type" : "挫伤",
]),
([      "action" : "$N一越拔空，长啸仿如龙吟，施一招「天外归星」，$w犹如一个光球劈向$n",
        "skill_name" : "天外归星",
        "force" : 640,
        "attack": 130,
        "dodge" : -62,
        "parry" : -33,
        "lvl"   : 300,
        "damage": 134,
        "damage_type" : "挫伤",
]),
});


int valid_enable(string usage)
{
	return usage == "hammer" || usage == "parry";
}

int valid_learn(object me)
{
        if (me->query("str") < 35)
                return notify_fail("你的先天膂力孱弱，无法修炼雷霆斧法。\n");

        if ((int)me->query("max_neili") < 3000)
                return notify_fail("你的内力修为太浅，无法修炼雷霆斧法。\n");

        if ((int)me->query_skill("force") < 300)
                return notify_fail("你的内功火候太浅，无法修炼雷霆斧法。\n");

        if ((int)me->query_skill("hammer", 1) < 180)
                return notify_fail("你的基本锤法火候太浅，无法修炼雷霆斧法。\n");

        if ((int)me->query_skill("hammer", 1) < (int)me->query_skill("leiting-fu", 1))
                return notify_fail("你的基本锤法水平有限，无法领会更高深的雷霆斧法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action) - 1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("leiting-fu",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (me->query_skill("leiting-fu", 1) < 260)
                return notify_fail("你对雷霆斧法了解不够，还不足以自行锻炼。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "hammer")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 130)
                return notify_fail("你的体力不够，练不了雷霆斧法。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你的内力不够，练不了雷霆斧法。\n");

        me->receive_damage("qi", 100);
        me->add("neili", -150);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"leiting-fu/" + action;
}
