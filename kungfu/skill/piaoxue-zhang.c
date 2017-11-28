#include <ansi.h>
inherit SKILL;

mapping *action = ({
([	"action" : "$N划身错步，一式「追风逐电」，双掌内拢外托，同时攻向$n的左肩",
        "force"  : 170,
        "attack" : 85,
        "dodge"  : 38,
        "parry"  : 38,
        "damage" : 36,
        "lvl"    : 0,
        "skill_name" : "追风逐电",
        "damage_type" : "内伤"
]),
([	"action" : "$N一式「云飘四海」，双掌虚虚实实，以迅雷不及掩耳之势劈向$n",
        "force"  : 210,
        "attack" : 98,
        "dodge"  : 43,
        "parry"  : 43,
        "damage" : 44,
        "lvl"    : 40,
        "skill_name" : "云飘四海",
        "damage_type" : "内伤"
]),
([	"action" : "$N使一式「八方云涌」，劲气弥漫，双掌如轮，一环环向$n的后背斫去",
        "force"  : 280,
        "attack" : 103,
        "dodge"  : 51,
        "parry"  : 51,
        "damage" : 58,
        "lvl"    : 80,
        "skill_name" : "八方云涌",
        "damage_type" : "内伤"
]),
([	"action" : "$N一式「龙卷暴伸」，双掌似让非让，似顶非顶，气浪如急流般使$n陷身其中",
        "force"  : 340,
        "attack" : 125,
        "dodge"  : 65,
        "parry"  : 65,
        "damage" : 67,
        "lvl"    : 120,
        "skill_name" : "龙卷暴伸",
        "damage_type" : "内伤"
]),
([	"action" : "$N一式「冰封万里」，掌影层层叠叠，飘飘渺渺，凌厉的掌风直涌$n而去",
        "force"  : 370,
        "attack" : 131,
        "dodge"  : 68,
        "parry"  : 68,
        "damage" : 71,
        "lvl"    : 160,
        "skill_name" : "冰封万里",
        "damage_type" : "内伤"
]),
([	"action" : "$N双手变幻，五指轻弹，一招「穹寰飞仙」，力分五路，招划十方笼罩$n",
        "force"  : 410,
        "attack" : 145,
        "dodge"  : 73,
        "parry"  : 73,
        "damage" : 82,
        "lvl"    : 200,
        "skill_name" : "穹寰飞仙",
        "damage_type" : "内伤"
]),
});

int valid_enable(string usage) { return usage == "strike" ||  usage == "parry"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练飘雪穿云掌必须空手。\n");

        if ((int)me->query("con") < 28)
                return notify_fail("你的先天根骨欠佳，不能练飘雪穿云掌。\n");

        if ((int)me->query("str") < 32)
                return notify_fail("你的先天臂力孱弱，不能练飘雪穿云掌。\n");

        if (me->query_skill("force") < 200)
                return notify_fail("你的内功火候不够，不能练飘雪穿云掌。\n");

        if (me->query_skill("strike", 1) < 100)
                return notify_fail("你的掌法根基不够，不能练飘雪穿云掌。\n");

        if (me->query("max_neili") < 2200)
                return notify_fail("你的内力修为太浅，无法练飘雪穿云掌。\n");

        if (me->query_skill("strike", 1) < me->query_skill("sixiang-zhang", 1))
                return notify_fail("你的基本掌法太差，无法领会更高深的飘雪穿云掌。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if(level >= action[i-1]["lvl"])
                        return action[i-1]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level   = (int)me->query_skill("piaoxue-zhang",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 120)
                return notify_fail("你的内力不够练习飘雪穿云掌。\n");

        if (me->query_skill("sixiang-zhang", 1) < 100)
        {
                me->receive_damage("qi", 60);
                me->add("neili", -80);
        } else
        {
                me->receive_damage("qi", 80);
                me->add("neili", -100);
        }
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int lvl;

        lvl = me->query_skill("piaoxue-zhang", 1);

        if (damage_bonus < 180 || lvl < 160) return 0;

        if (damage_bonus / 6 > victim->query_con())
        {
                victim->receive_wound("qi", (damage_bonus - 140) / 3, me);
                	return HIR "只听$n" HIR "前胸“喀嚓”一声闷响，竟"
                               "似折断了一跟肋骨。\n" NOR;
        }
}

string perform_action_file(string action)
{
        return __DIR__"piaoxue-zhang/"+ action;
}
