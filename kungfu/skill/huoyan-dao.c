// huoyan-dao.c 火焰刀
#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action": "$N使出一招「钻木取火」，飞身急转，双掌向前平平拍向$n",
        "skill_name" : "钻木取火",
        "force" : 90,
        "attack": 25,
        "dodge" : 15,
        "parry" : 25,
        "lvl"   : 0,
        "damage": 40,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使出一招「祝融怀焰」，手掌如刀，斜斜劈向$n的$l",
        "skill_name" : "祝融怀焰",
        "force" : 130,
        "attack": 47,
        "dodge" : 25,
        "parry" : 31,
        "lvl"   : 30,
        "damage": 55,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使出一招「风火无边」，双掌一拍，一道内力自掌中攻向$n的$l",
        "skill_name" : "风火无边",
        "force" : 180,
        "attack": 61,
        "dodge" : 25,
        "parry" : 40,
        "lvl"   : 60,
        "damage": 65,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使出一招「六道轮回」，双手合十，当头劈向$n",
        "skill_name" : "六道轮回",
        "force" : 240,
        "attack": 75,
        "dodge" : 20,
        "parry" : 47,
        "lvl"   : 90,
        "damage": 70,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使出一招「双龙吐焰」，双掌一错，两道内力交叉攻向$n的$l",
        "skill_name" : "双龙吐焰",
        "force" : 300,
        "attack": 80,
        "dodge" : 30,
        "parry" : 56,
        "lvl"   : 120,
        "damage": 80,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使出一招「刀山火海」，双掌向下斜拍，顿时万千道内力从四面八方攻向$n",
        "skill_name" : "刀山火海",
        "force" : 350,
        "attack": 91,
        "dodge" : 35,
        "parry" : 62,
        "lvl"   : 140,
        "damage": 85,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使出一招「白佛光度」，左臂回收，右掌引内力直刺$n的$l",
        "skill_name" : "白佛光度",
        "force" : 370,
        "attack": 102,
        "dodge" : 37,
        "parry" : 78,
        "lvl"   : 160,
        "damage": 90,
        "damage_type" : "瘀伤",
]),
([      "action": "$N使出一招「火内莲花」，双掌微并，两臂前伸，一道内劲如排山倒海般攻向$n",
        "skill_name" : "火内莲花",
        "force" : 400,
        "attack": 110,
        "dodge" : 45,
        "parry" : 84,
        "lvl"   : 180,
        "damage": 109,
        "damage_type" : "瘀伤",
]),
([      "action": " "RED" 火焰刀之极意 "NOR"",
        "force"  : (int)this_player()->query_skill("force", 1)/3 + random((int)this_player()->query_skill("force")),
        "attack" : (int)this_player()->query_skill("strike", 1)/4 + random((int)this_player()->query_skill("strike", 1)/2),
        "dodge"  : (int)this_player()->query_skill("dodge", 1)/6 + random((int)this_player()->query_skill("force", 1)/3),
        "parry"  : (int)this_player()->query_skill("parry", 1)/6 + random((int)this_player()->query_skill("parry", 1)/3),
        "damage" : (int)this_player()->query_skill("force", 1)/4 + random((int)this_player()->query_skill("strike", 1)/2),
        "lvl"    : 200,
        "skill_name" : "极意",
        "damage_type": "内伤"
]),
});


int valid_enable(string usage) { return usage == "strike" || usage == "parry"; }

int valid_combine(string combo)
{
    return combo == "dashou-yin" ||
           combo == "yujiamu-quan";
}

int valid_learn(object me)
{
    int skill;
    skill = me->query_skill("huoyan-dao", 1);

    if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
        return notify_fail("练火焰刀必须空手。\n");

    if ((int)me->query("con") < 32)
        return notify_fail("你的先天根骨孱弱，难以修炼火焰刀。\n");

    if ((int)me->query("shen") > - skill * 1000)
        return notify_fail("你的杀气不够，难以领悟更高深的火焰刀。\n");

    if ((int)me->query("max_neili") < 1200)
        return notify_fail("你的内力不够。\n");

    if ((int)me->query_skill("force") < 150)
        return notify_fail("你的内功火候太浅。\n");

    if (me->query_skill("strike", 1) < me->query_skill("huoyan-dao", 1))
        return notify_fail("你的基本掌法火候有限，无法领会更高深的火焰刀法。\n");

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
        level = (int) me->query_skill("huoyan-dao",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
//    object weapon;
    int cost;
    cost = me->query_skill("huoyan-dao", 1) / 5 + 60;

    if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
        return notify_fail("练火焰刀必须空手。\n");

    if ((int)me->query("qi") < 70)
        return notify_fail("你的体力不够，练不了火焰刀。\n");

    if ((int)me->query("neili") < 70)
        return notify_fail("你的内力不够，练不了火焰刀。\n");

    me->receive_damage("qi", 55);
    me->add("neili", -cost);
    return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int lvl, lvl2, damage;
        //object cloth;
        //string msg;

        lvl = me->query_skill("huoyan-dao", 1);
        lvl2 = victim->query_skill("force") / 2;

        if (damage_bonus < 150 || lvl < 150) return 0;

        if (lvl + damage_bonus / 10 > lvl2 + victim->query_con())
        {
                /*if (objectp(cloth = victim->query_temp("armor/cloth"))
                    && cloth->query("consistence") > 0)
                    {
                        cloth->add("consistence", -10);
                        msg = HIR "只见$n身上的" + cloth->name() + "突然烧了起来。\n" NOR;
                        message_combatd(msg, me, victim);
                    }

                if (cloth->query("consistence") < 0)
                    cloth->set("consistence", 0);
                */
                if (me->query("shen") < - lvl * lvl * lvl)
                    damage = damage_bonus + random(lvl);
                else
                    damage = damage_bonus;
                victim->receive_wound("qi", (damage - 80) / 3, me);

                return random(2) ? HIR "只听$n" HIR "前胸「咔嚓」一声脆响，竟像是"
                                   "肋骨断折的声音。\n" NOR:

                                   HIR "$n" HIR "一声惨叫，胸前「咔嚓咔嚓」几声脆"
                                   "响，口中鲜血狂喷。\n" NOR;
        }
}

string perform_action_file(string action)
{
    return __DIR__"huoyan-dao/" + action;
}
