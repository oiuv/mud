#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N身形斜飞，手中$w轻轻点向$n的腕部",
        "force"  : 60,
        "dodge"  : 20,
        "parry"  : 10,
        "damage" : 5,
        "damage_type" : "刺伤"
]),
([      "action" : "$N长跃而起，$w猛然下刺，直打$n腕部的神门穴",
        "force"  : 74,
        "dodge"  : 25,
        "parry"  : 13,
        "damage" : 9,
        "damage_type" : "刺伤"
]),
([      "action" : "$N手中$w自上而下反刺，模拟冰轮横空、清光铺地的光景",
        "force"  : 86,
        "attack" : 27,
        "dodge"  : 15,
        "parry"  : 17,
        "damage" : 17,
        "damage_type" : "刺伤"
]),
([      "action" : "$N手中$w颤动来回挥削，只幌得$n眼花撩乱，浑不知从何攻来",
        "force"  : 89,
        "attack" : 31,
        "dodge"  : 25,
        "parry"  : 25,
        "damage" : 21,
        "damage_type" : "刺伤"
]),
([      "action" : "$N手中$w由内自外一刺，左手虚击，身形一晃，$w已搭在$n腕部",
        "force"  : 107,
        "attack" : 38,
        "dodge"  : 30,
        "parry"  : 35,
        "damage" : 29,
        "damage_type" : "刺伤"
]),
([      "action" : "$N左掌横摆胸前，右手中$w轻轻挥拂，直取$n的神门要穴",
        "force"  : 130,
        "attack" : 29,
        "dodge"  : 35,
        "parry"  : 37,
        "damage" : 28,
        "damage_type" : "刺伤"
]),
([      "action" : "$N手中$w中宫直入，携着强大的劲道攻向$n的$l",
        "force"  : 160,
        "attack" : 42,
        "dodge"  : 45,
        "parry"  : 40,
        "damage" : 39,
        "damage_type" : "刺伤"
]),
});

int valid_enable(string usage)
{
	return usage == "sword" || usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query_skill("force") < 60)
                return notify_fail("你的内功火候不到，无法学习神门十三剑。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你的内力太差，无法学习神门十三剑。\n");

        if (me->query_skill("sword", 1) < me->query_skill("shenmen-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的神门十三剑。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;  
        level = (int) me->query_skill("shenmen-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];

}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        object weapon;
        weapon = victim->query_temp("weapon");

        if (! victim->query_temp("weapon")
           || ! living(victim)
           || me->query("max_neili") / 2 < victim->query("max_neili")
           || damage_bonus < 100
           || me->query("neili") < 500
           || me->query_skill("shenmen-jian", 1) < 80
           || victim->is_busy()
           || random(2) == 1)
                return 0;

        victim->start_busy(2);
        victim->receive_wound("qi", (damage_bonus - 100) / 4, me);
        weapon->move(environment(victim));

        return HIW "突然间$n" HIW "被$N" HIW "一剑刺中神门要穴，手中" +
               weapon->name() + HIW "再也抓拿不住，不禁脱手飞出。\n" NOR;
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 65)
                return notify_fail("你的体力不够练神门十三剑。\n");

        if ((int)me->query("neili") < 65)
                return notify_fail("你的内力不足以练神门十三剑。\n");

        me->receive_damage("qi", 52);
        me->add("neili", -58);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"shenmen-jian/" + action;
}

