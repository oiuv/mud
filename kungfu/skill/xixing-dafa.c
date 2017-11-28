#include <ansi.h>

inherit FORCE;

int valid_enable(string usage)
{
	return usage == "force";
}

int valid_force(string force)
{
        return 1;
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("xixing-dafa", 1);
        return lvl * lvl * 15 * 20 / 100 / 200;
}

int valid_learn(object me)
{
        int lvl = (int)me->query_skill("xixing-dafa", 1);

        if (me->query("character") == "光明磊落")
                return notify_fail("你心中暗道：这种害人的武功，我学它作甚？\n");

        if (me->query("con") < 30)
                return notify_fail("你试着按照法门运转了一下内息，忽然觉得心火如"
                                   "焚，丹田却是一阵冰凉！\n");

        if ((int)me->query_skill("force", 1) < 100)
                return notify_fail("你的基本内功修为不足，难以修炼吸星大法。\n");

        if (! me->query("can_learn/xixing-dafa/ren")
           && me->query("max_neili")
           && lvl < 200
           && lvl >= 10)
                return notify_fail("你没有按照吸星大法的诀窍将内力散去，现在还不"
                                   "敢妄自继续修行大法。\n");

        return ::valid_learn(me);
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mapping result;
        int ap, dp;
        int jiali;

        if ((int)me->query_skill("xixing-dafa", 1) < 80
           || ! living(me))
                return;

        if ((jiali = ob->query("jiali")) < 1
            || ob->query_skill_mapped("force") == "taixuan-gong")
                return;

        ap = ob->query_skill("force");
        dp = me->query_skill("force");
        if (ap / 2 + random(ap) < dp)
        {
                if (me->query("neili") < me->query("max_neili") * 15 / 10)
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
        return notify_fail("吸星大法只能用学的，或是从运用(exert)中增加熟练度。\n");
}

void check_count(object me)
{
        if (! me->query("can_learn/xixing-dafa/ren")
           && me->query("max_neili") >= 3000
           && me->query("exception/xixing-count") > 1000)
        {
                me->apply_condition("xixing-fanshi",
                        me->query_condition("xixing-fanshi") +
                        me->query("exception/xixing-count") / 10);
                me->delete("exception/xixing-count");
        }
}

void skill_improved(object me)
{
        me->add("exception/xixing-count", me->query_skill("xixing-dafa", 1) + 1);
        check_count(me);
}

string exert_function_file(string func)
{
        return __DIR__"xixing-dafa/" + func;
}
