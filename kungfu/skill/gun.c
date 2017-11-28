#include <ansi.h>
inherit SKILL;

mapping *action = ({
([	"action" : HIR "$N" HIR "抠动扳机，手中$w" HIR "顿时喷出一股火舌，射向$n"
                   HIR "的$l" HIR,
        "force"  : 999,
        "attack" : 999,
        "dodge"  : 999,
        "parry"  : 999,
        "damage" : 999,
        "lvl"    : 0,
        "damage_type" : "枪伤"
]),
});

int valid_enable(string usage) { return usage == "hammer"; }

int valid_learn(object me)
{
        if (! wizardp(me))
                return notify_fail("你无法学习枪械技术。\n");

        return 1;
}

int practice_skill(object me)
{
        if (! wizardp(me))
                return notify_fail("你无法学习枪械技术。\n");

        if ((int)me->query("qi") < 10)
                return notify_fail("你的体力太低了。\n");

        me->receive_damage("qi", 1);
        return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("gun", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];

}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        victim->receive_wound("qi", damage_bonus * 3, me);
        return HIR "只听“轰”的一声巨响，一团火焰已穿透$n"
               HIR "的胸膛，鲜血顿时狂涌而出。\n" NOR;

}

string perform_action_file(string action)
{
        return __DIR__"gun/" + action;
}
