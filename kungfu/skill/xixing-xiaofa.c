#include <ansi.h>

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
        return 1;
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("xixing-xiaofa", 1);
        return lvl * lvl * 15 * 2 / 100 / 200;
}

int valid_learn(object me)
{
        if ((int)me->query_skill("force", 1) < 80)
                return notify_fail("你的基本内功火候不足，不能学吸功入地小法。\n");

        if (me->query("gender") == "无性" && (int)me->query_skill("xixing-xiaofa", 1) > 99)
                return notify_fail("你无根无性阴阳不调，难以领会高深的吸功入地小法。\n");

        if ((int)me->query_skill("force", 1) < (int)me->query_skill("xixing-xiaofa", 1))
                return notify_fail("你的基本内功水平有限，不能领会更高深的吸功入地小法。\n");

        return ::valid_learn(me);
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mapping result;
        int ap, dp;
        int jiali;

        if ((int) me->query_skill("xixing-xiaofa", 1) < 80 ||
            ! living(me))
                return;

        if ((jiali = ob->query("jiali")) < 1)
                return;

        ap = ob->query_skill("force");
        dp = me->query_skill("force");
        if (ap / 2 + random(ap) < dp)
        {
                result = ([ "damage" : -damage ]);

                switch (random(3))
                {
                case 0:
                        result += ([ "msg" : HIM "$N" HIM "只觉得内力源源而泻"
                                             "，转如地下，不由得大吃一惊。\n" NOR ]);
                        break;
                case 1:
                        result += ([ "msg" : HIM "$N" HIM "只觉得发出的内力犹"
                                             "如石沉大海，被$n尽数转如地下。\n" NOR ]);
                        break;

                default:
                        result += ([ "msg" : HIM "$N" HIM "不住催动内力，但是"
                                             "只觉得$n竟似毫不费力。\n" NOR ]);
                        break;
                }
                return result;
        }
}

int practice_skill(object me)
{
        return notify_fail("吸功入地小法只能用学(learn)或练毒的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        // 为了NPC向问天能够施展天寰神诀的POWERUP，故意设定为这样。
        return __DIR__"tianhuan-shenjue/" + func;
}
