// yuenv-jian.c 越女剑术
// Modify by Rcwiz for hero.cd

inherit SKILL;
#include <ansi.h>

mapping *action = ({
([      "action" : "$N手中$w轻轻点向$n的$l，迅疾无比",
        "force"  : 100,
        "attack" : 130,
        "dodge"  : 120,
        "parry"  : 12,
        "damage" : 70,
        "lvl"    : 0,
        "damage_type" : "刺伤"
]),
([      "action" : "$N长跃而起，手中的$w挽了一个剑花，猛然刺向$n",
        "force"  : 120,
        "attack" : 140,
        "dodge"  : 125,
        "parry"  : 15,
        "damage" : 84,
        "lvl"    : 20,
        "damage_type" : "刺伤"
]),
([      "action" : "$N使出回身侧步，手中的$w斜刺$n的$l",
        "force"  : 140,
        "attack" : 140,
        "dodge"  : 130,
        "parry"  : 10,
        "damage" : 100,
        "lvl"    : 50,
        "damage_type" : "内伤"
]),
([      "action" : "$N却身提步，手中的$w似挡飞挡，似进非进，忽的直刺$n",
        "force"  : 160,
        "attack" : 160,
        "dodge"  : 138,
        "parry"  : 10,
        "damage" : 110,
        "lvl"    : 75,
        "damage_type" : "刺伤"
]),
([      "action" : "$N手中$w颤动的极快，只幌得$n眼花撩乱，浑不知从何攻来",
        "force"  : 180,
        "attack" : 180,
        "dodge"  : 145,
        "parry"  : 12,
        "damage" : 125,
        "lvl"    : 100,
        "damage_type" : "内伤"
]),
([      "action" : "$N剑柄提起，剑尖下指，有如提壶斟酒，直挥$n的$l",
        "force"  : 200,
        "attack" : 185,
        "dodge"  : 150,
        "parry"  : 18,
        "damage" : 130,
        "lvl"    : 130,
        "damage_type" : "刺伤"
]),
([      "action" : "$N手中$w由内自外一刺，没有任何花巧，然而来是快得不可思议",
        "force"  : 220,
        "attack" : 210,
        "dodge"  : 155,
        "parry"  : 15,
        "damage" : 140,
        "lvl"    : 160,
        "damage_type" : "刺伤"
]),
([      "action" : "$N轻叹一声，手中的$w化作一到长弧点向$n",
        "force"  : 240,
        "attack" : 230,
        "dodge"  : 170,
        "parry"  : 22,
        "damage" : 150,
        "lvl"    : 200,
        "damage_type" : "刺伤"
]),
([      "action" : "$N一抖手中的$w，挽出数个剑花，笼罩了$n",
        "force"  : 260,
        "attack" : 250,
        "dodge"  : 185,
        "parry"  : 25,
        "damage" : 155,
        "lvl"    : 225,
        "damage_type" : "刺伤"
]),
([  "action" : "$N一声轻笑，手中$w幻化作满天星点，不知刺向$n的何处",
        "force"  : 320,
        "attack" : 280,
        "dodge"  : 220,
        "parry"  : 30,
        "damage" : 180,
        "lvl"    : 250,
        "damage_type" : "刺伤"
]),
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }

int valid_learn(object me)
{

        if (me->query("gender") != "女性")
                return notify_fail("你练来练去觉得这个剑法还是适合女性练习！\n");

        if (me->query("dex") < 36)
                return notify_fail("你先天身法不足，无法修炼越女剑术。\n");

        if ((int)me->query_skill("dodge", 1) < 200)
                return notify_fail("你的轻功火候不到，无法运用越女剑术。\n");

        if ((int)me->query_skill("sword", 1) < 200)
                return notify_fail("你的剑术功底不行，难以领会越女剑术。\n");

        if ((int)me->query("max_neili") < 1200)
                return notify_fail("你的内力太差，无法学习越女剑术。\n");

	if ((int)me->query_skill("sword", 1) < (int)me->query_skill("yuenv-jian", 1))
		return notify_fail("你的基本剑法水平有限，无法领会更高深的越女剑术。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("yuenv-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];

}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够练越女剑术。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不足以练越女剑术。\n");

        me->receive_damage("qi", 64);
        me->add("neili", -65);
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus, int i, int attack_time)
{
        object weapon;
        //string name;
        int ap, dp;

        weapon = me->query_temp("weapon");

        attack_time = (int)(me->query_skill("yuenv-jian", 1) / 40);

        if (attack_time > 7)
                attack_time = 7;

        ap = me->query_skill("sword"); 
        dp = victim->query_skill("dodge");

        if (me->is_busy()
           || ! living(victim)
           || me->query("neili") < 200
           || ap * 3 / 5 + random(ap) < dp
           || me->query_temp("is_attacking")
           || me->query_skill_mapped("sword") != "yuenv-jian"
           || me->query_skill("yuenv-jian", 1) < 120)
        	return 0;
        
        message_vision(HIW "\n霎那间，只见$N" HIW "手中" + weapon->name() + HIW "轻盈灵动"
                       "，优美华丽，不带一丝尘俗之气，却将$n" HIW "攻得无暇反击！\n"
                       NOR, me, victim);

        me->set_temp("is_attacking", 1);
        me->start_busy(1 + random(attack_time / 2));
        me->add("neili", -attack_time * 20);
        for (i = 0; i < attack_time; i++)
        {
                if (! me->is_fighting(victim))
                        break;

                if (! victim->is_busy() && random(2))
                        victim->start_busy(1);

                COMBAT_D->do_attack(me, victim, weapon, 0);
        }

        me->delete_temp("is_attacking");
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"yuenv-jian/" + action;
}

