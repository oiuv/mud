// huagong-dafa.c 化功大法
// Modified by rcwiz 2003

#include <ansi.h>

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
    return force == "guixi-gong";
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("huagong-dafa", 1);
        return lvl * lvl * 15 * 20 / 100 / 200;
}

int valid_learn(object me)
{
        if (me->query("character") == "光明磊落")
                return notify_fail("你心中暗想：我为人光明磊落，岂能学习这种害人武功？\n");

        if (me->query("character") == "狡黠多变")
                return notify_fail("你心中暗想：我虽然不是谦谦君子，但这种损人不利己的武功学来何用？\n");

        if (me->query("con") < 30)
                return notify_fail("你试着运转了一下内力，登时觉得胸闷难耐！\n");

        if ((int)me->query_skill("force", 1) < 120)
                return notify_fail("你的基本内功火候不足，不能学化功大法。\n");

        if ((int)me->query_skill("poison", 1) < 120)
                return notify_fail("你的基本毒技火候不足，不能学化功大法。\n");

        if (me->query("gender") == "无性" && (int)me->query_skill("huagong-dafa", 1) > 99)
                return notify_fail("你无根无性，阴阳不调，难以领会高深的化功大法。\n");

        if ((int)me->query_skill("poison", 1) < (int)me->query_skill("huagong-dafa", 1))
                return notify_fail("你的基本毒技水平有限，不能领会更高深的化功大法。\n");

        if ((int)me->query_skill("force", 1) < (int)me->query_skill("huagong-dafa", 1))
                return notify_fail("你的基本内功水平有限，不能领会更高深的化功大法。\n");

        return ::valid_learn(me);
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mapping result;
        int ap, dp;
        int jiali;
		int lvl;

        if ((int) me->query_skill("huagong-dafa", 1) < 80 ||
            ! living(me))
                return;

        if ((jiali = ob->query("jiali")) < 1)
                return;
		lvl = me->query_skill("huagong-dafa", 1);
        ap = ob->query_skill("force") + ob->query_skill("dodge");
        dp = me->query_skill("force") + me->query_skill("dodge");
        if (ap / 2 + random(ap) < dp)
        {
                result = ([ "damage" : -damage ]);
				
				if (ob->query("neili") > jiali)
						ob->add("neili", -jiali);
				
				switch (random(3))
                {
                case 0:
                        result += ([ "msg" : HIM "$N" HIM "只觉得内力源源而泻"
                                             "，不由得大吃一惊。\n" NOR ]);
                        break;
                case 1:
                        result += ([ "msg" : HIM "$N" HIM "只觉得发出的内力犹"
                                             "如石沉大海，不知所踪。\n" NOR ]);
                        break;

                default:
                        result += ([ "msg" : HIM "$N" HIM "不住催动内力，但是"
                                             "只觉得$n竟似毫不费力。\n" NOR ]);
                        break;
                }
				
				ob->affect_by("freezing",
                               ([ "level"    : jiali,
                                  "id"       : me->query("id"),
                                  "duration" : lvl / 60 + random(lvl / 30) ]));
				
                return result;
        }
}

int practice_skill(object me)
{
        return notify_fail("化功大法只能用学(learn)或练毒的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"huagong-dafa/" + func;
}
