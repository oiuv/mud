#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action" : "$N身形一晃而至，一招「小鬼勾魂」，双掌带着一缕腥风拍向$n的前心",
        "force" : 100,
        "attack": 25,
        "dodge" : 15,
        "parry" : 20,
        "damage": 10,
        "lvl"   : 0,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N身形化做一缕轻烟绕着$n急转，一招「天网恢恢」，双掌幻出无数掌影罩向$n",
        "force" : 130,
        "attack": 30,
        "dodge" : 10,
        "parry" : 15,
        "damage": 20,
        "lvl"   : 30,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N怪叫一声，一招「阴风怒号」，双掌铺天盖地般拍向$n的$l",
        "force" : 160,
        "attack": 45,
        "dodge" : 20,
        "parry" : 20,
        "damage": 25,
        "lvl"   : 60,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一照「凄雨冷风」，双掌拍出满天阴风，忽然右掌悄无声息的拍向$n的$l",
        "force" : 180,
        "attack": 50,
        "dodge" : 20,
        "parry" : 30,
        "damage": 30,
        "lvl"   : 80,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N大喝一声，一招「恶鬼推门」，单掌如巨斧开山带着一股腥风猛劈向$n的面门",
        "force" : 210,
        "attack": 65,
        "dodge" : 25,
        "parry" : 20,
        "damage": 35,
        "lvl"   : 100,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一声冷笑，一招「灵蛇九转」，身形一闪而至，一掌轻轻拍出，手臂宛若无骨，掌到中途竟连\n"
                   "变九变，如鬼魅般印向$n的$l",
        "force" : 280,
        "attack": 95,
        "dodge" : 25,
        "parry" : 25,
        "damage": 45,
        "lvl"   : 120,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N侧身向前，一招「地府阴风」，双掌连环拍出，一缕缕彻骨的寒气从掌心透出，将$n周围的空\n"
                   "气都凝结了",
        "force" : 320,
        "attack": 110,
        "dodge" : 30,
        "parry" : 30,
        "damage": 60,
        "lvl"   : 140,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N厉叫一声，身形忽的蜷缩如球，飞身撞向$n，一招「黄蜂吐刺」单掌如剑，直刺$n的心窝",
        "force" : 360,
        "attack": 135,
        "dodge" : 30,
        "parry" : 35,
        "damage": 75,
        "lvl"   : 160,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一个急旋，飞身纵起，半空中一式「毒龙摆尾」，反手击向$n的$l",
        "force" : 420,
        "attack": 150,
        "dodge" : 30,
        "parry" : 75,
        "damage": 90,
        "lvl"   : 180,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N大喝一声，运起五毒神功，一招「毒火焚身」，刹那间全身毛发尽绿，一对碧绿的双爪闪电般的朝\n"
                   "$n的$l抓去",
        "force" : 450,
        "attack": 185,
        "dodge" : 40,
        "parry" : 80,
        "damage": 120,
        "lvl"   : 200,
        "damage_type" : "抓伤"
])
});

int valid_enable(string usage)
{
        return usage=="hand" || usage=="parry";
}

int valid_learn(object me)
{

        if (me->query("character") == "光明磊落")
                return notify_fail("你心中暗想：我为人光明磊落，岂能学习这种害人武功？\n");

        if (me->query("character") == "狡黠多变")
                return notify_fail("你心中暗想：哼，这种武功虽然厉害，但对自身损害极大，学来何用？\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练千蛛万毒手必须空手。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，无法练习千蛛万毒手。\n");

        if ((int)me->query("max_neili") < 1000)
                return notify_fail("你的内力太弱，无法练习千蛛万毒手。\n");

        if ((int)me->query_skill("hand", 1) < 80)
                return notify_fail("你的基本手法火候不够，无法练千蛛万毒手。\n");

        if ((int)me->query_skill("hand", 1) < (int)me->query_skill("qianzhu-wandushou", 1))
                return notify_fail("你的基本手法水平有限，无法领会更高深的千蛛万毒手。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level   = (int) me->query_skill("qianzhu-wandushou",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

mixed hit_ob(object me, object victim, int damage_bonus, int factor)
{
        int lvl;
        int flvl;

        lvl  = me->query_skill("qianzhu-wandushou", 1);
        flvl = me->query("jiali");
        if (lvl < 80 || flvl < 10 || ! damage_bonus)
                return;

        if (flvl * 2 + random(lvl) > victim->query_skill("force") &&
            victim->affect_by("qianzhu_wandushou",
                              ([ "level" : flvl + random(flvl),
                                 "id"    : me->query("id"),
                                 "duration" : lvl / 50 + random(lvl / 20) ])))
        {
                return HIB "$n" HIB "忽然感到一股莫名的恶心，毒气攻心，全身顿时瘫软。\n" NOR;
        }
}

int practice_skill(object me)
{
        return notify_fail("千蛛万毒手只有通过吸取毒虫的毒素练功来提高。\n");
}

string perform_action_file(string action)
{
        return __DIR__"qianzhu-wandushou/" + action;
}
