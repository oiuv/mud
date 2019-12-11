#include <ansi.h>
inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action" : "$N一声大喝，左掌叠于右掌之上，劈向$n",
        "force" : 210,
        "attack": 22,
        "dodge" : 30,
        "parry" : 31,
        "damage": 15,
        "lvl"   : 0,
        "damage_type" : "内伤"
]),
([      "action" : "$N面色凝重，双掌轻抖，飘忽不定地拍向$n",
        "force" : 270,
        "attack": 38,
        "dodge" : 25,
        "parry" : 33,
        "damage": 30,
        "lvl"   : 20,
        "damage_type" : "内伤"
]),
([      "action" : "$N气沉丹田，双掌幻化一片掌影，将$n笼罩于内。",
        "force" : 320,
        "attack": 62,
        "dodge" : 43,
        "parry" : 44,
        "damage": 35,
        "lvl"   : 40,
        "damage_type" : "内伤"
]),
([      "action" : "$N跨前一步，右掌中攻直进，向$n的$l连击三掌",
        "force" : 370,
        "attack": 75,
        "dodge" : 55,
        "parry" : 68,
        "damage": 50,
        "lvl"   : 60,
        "damage_type" : "内伤"
]),
([      "action" : "$N沉身顿气，贯出双掌，顿时只见一片掌影攻向$n",
        "force" : 420,
        "attack": 82,
        "dodge" : 52,
        "parry" : 80,
        "damage": 30,
        "lvl"   : 80,
        "damage_type" : "内伤"
]),
([      "action" : "$N双掌平挥，猛击向$n的$l，毫无半点花巧可言",
        "force" : 460,
        "attack": 103,
        "dodge" : 65,
        "parry" : 101,
        "damage": 50,
        "lvl"   : 100,
        "damage_type" : "内伤"
]),
([      "action" : "$N体内真气迸发，双掌缤纷拍出，顿时一片掌影笼罩$n",
        "force" : 510,
        "attack": 128,
        "dodge" : 63,
        "parry" : 125,
        "damage": 80,
        "lvl"   : 120,
        "damage_type" : "内伤"
]),
([      "action" : "$N左掌虚晃，右掌携着千钧之力猛然向$n的头部击落",
        "force" : 530,
        "attack": 125,
        "dodge" : 77,
        "damage": 90,
        "parry" : 152,
        "lvl"   : 140,
        "damage_type" : "内伤"
]),
([      "action" : "$N身子蓦的横移，右手横扫$n的$l，左手攻向$n的胸口",
        "force" : 580,
        "attack": 131,
        "dodge" : 80,
        "parry" : 115,
        "damage": 100,
        "lvl"   : 160,
        "damage_type" : "内伤"
]),
([      "action" : "$N陡然一声暴喝，真气迸发，双掌同时击向$n的$l",
        "force" : 620,
        "attack": 132,
        "dodge" : 81,
        "parry" : 123,
        "damage": 130,
        "lvl"   : 180,
        "damage_type" : "内伤"
])
});

int valid_enable(string usage)
{
        return usage == "parry" || usage == "strike";
}

int double_attack()
{
        return 1;
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练千手如来掌必须空手。\n");

        if (me->query("con") < 32 )
                return notify_fail("你先天根骨不足，无法学习千手如来掌。\n");
        if ( me->query("dex") < 30 )
                return notify_fail("你先天身法不足，无法学习千手如来掌。\n");

        if ((int)me->query_skill("buddhism", 1) < 300)
                return notify_fail("你的禅宗心法不够，无法练千手如来掌。\n");

        if ((int)me->query_skill("force") < 300)
                return notify_fail("你的内功火候不够，无法练千手如来掌。\n");

        if ((int)me->query("max_neili") < 3500)
                return notify_fail("你的内力修为太浅，无法练千手如来掌。\n");

        if ((int)me->query_skill("strike", 1) < 200)
                return notify_fail("你的基本掌法火候不够，无法练千手如来掌。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("rulai-zhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的千手如来掌。\n");

        return 1;
}

mixed hit_ob(object me, object victim, int i, int damage_bonus)
{
        if (me->is_busy()
           || random(2) == 0
           || ! living(victim)
           || victim->is_busy()
           || damage_bonus < 150
           || me->query("neili") < 600
           || me->query_temp("action_flag") == 0
           || me->query_skill("buddhism", 1) < 300
           || me->query_skill("rulai-zhang", 1) < 180)
                return 0;

        // 避免在使用Pfm时讯息重复
        if (! me->query_temp("rulai-zhang/hit_msg"))
                message_sort(HIY "\n$N" HIY "忽然喝道：「" HIR + RANK_D->query_respect(victim) +
                             HIR "，接" + RANK_D->query_self(me) + HIR "一掌。" HIY "」说罢轻飘"
                             "飘拍出一掌，招式甚为寻常。但掌到中途，忽然微微摇晃，登时一掌变两"
                             "掌，两掌又变四掌，四势连环，尽数笼罩$n" HIY "周身。\n",
                             me, victim);

        me->start_busy(1 + random(3));
        me->add("neili", -200);

        for (i = 0; i < 4; i++)
        {
                if (! me->is_fighting(victim))
                        break;
                COMBAT_D->do_attack(me, victim, 0, 20);
        }

        if (damage_bonus / 6 > victim->query_con())
        {
                me->add("neili", -80);
                victim->receive_wound("qi", (damage_bonus - 120) / 2, me);
                return random(2) ? HIR "$n" HIR "被$N" HIR "凌厉的掌风划中气门，只"
                                   "感内息窒滞，“哇”的喷出一口鲜血！\n" NOR:

                                   HIR "$N" HIR "一掌拍出，只听$n" HIR "胸前“喀嚓"
                                   "喀嚓”几声脆响，竟似断了数根肋骨！\n" NOR;
        }

        return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("rulai-zhang", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 200)
                return notify_fail("你的体力太低了。\n");
        if ((int)me->query("neili") < 220)
                return notify_fail("你的内力不够练千手如来掌。\n");

        me->receive_damage("qi", 180);
        me->add("neili", -200);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"rulai-zhang/" + action;
}

