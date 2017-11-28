#include <ansi.h>

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
        return force == "xiaoyao-xinfa" ||
               force == "lingjiu-xinfa" ||
               force == "bahuang-gong" ||
               force == "xiaowuxiang";
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("beiming-shengong", 1);
        return lvl * lvl * 15 * 22 / 100 / 200;
}

int valid_learn(object me)
{
        int lvl = (int)me->query_skill("beiming-shengong", 1);

        if (me->query("gender") == "无性" && lvl > 49)
                return notify_fail("你无根无性，阴阳不调，难以领会高深的北冥神功。\n");

        if (me->query("int") < 32)
                return notify_fail("你觉得北冥神功艰深无比，难以领会。\n");

        if (me->query("con") < 24)
                return notify_fail("你试着运转了一下内力，眼前登时一黑！\n");

        return ::valid_learn(me);
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mapping result;
        int ap, dp;
        int jiali;

        if ((int) me->query_skill("beiming-shengong", 1) < 70 ||
            ! living(me) 
            || ob->query_skill_mapped("force") == "taixuan-gong")
                return;

        if ((jiali = ob->query("jiali")) < 1)
                return;

        ap = ob->query_skill("force");
        dp = me->query_skill("force");
        if (ap / 2 + random(ap) < dp)
        {
                if (me->query("neili") < me->query("max_neili") * 2)
                        me->add("neili", jiali);

                result = ([ "damage" : -damage ]);

                switch (random(4))
                {
                case 0:
                        result += ([ "msg" : HIM "$N" HIM "只觉得内力源源而泻"
                                             "，不由得大吃一惊。\n" NOR ]);
                        break;
                case 1:
                        result += ([ "msg" : HIM "$N" HIM "只觉得发出的内力犹"
                                             "如石沉大海，不知所踪。\n" NOR ]);
                        break;
                case 2:
                        result += ([ "msg" : HIM "$N" HIM "只觉得发出的内力犹"
                                             "无影无踪，浑然不知着落。\n" NOR ]);
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
    return notify_fail("北冥神功只能通过学习，或是从运用(exert)中增加熟练度。\n");
}

string exert_function_file(string func)
{
    return __DIR__"beiming-shengong/" + func;
}
