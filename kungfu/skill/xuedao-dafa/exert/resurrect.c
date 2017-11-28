// resurrect.c 浴血重生

#include <ansi.h>

#define R "「" HIR "浴血重生" NOR "」"

inherit F_CLEAN_UP;

int exert(object me, object target)
{
        int skill;
        string msg;
        mapping my;
        int rp;
        int neili_cost;

        if (userp(me) && ! me->query("can_perform/xuedao-dafa/resurrect"))
                return notify_fail("你所学的内功中没有这种功能。\n");

        if ((int)me->query_skill("xuedao-dafa", 1) < 120)
                return notify_fail("你的血刀大法不够深厚，难以施展" R "。\n");

        if ((int)me->query("max_neili") < 1000) 
                return notify_fail("你的内力修为不足，难以施展" R "。\n");

        if ((int)me->query("neili") < 200) 
                return notify_fail("你现在的真气不够，难以施展" R "。\n");

        my = me->query_entire_dbase();
        if ((rp = (my["max_qi"] - my["eff_qi"])) < 1)
                return (SKILL_D("force") + "/recover")->exert(me, target);

        if (rp >= my["max_qi"] / 10)
                rp = my["max_qi"] / 10;

        skill = me->query_skill("xuedao-dafa", 1);
        msg = HIR "$N" HIR "深深吸入一口气，脸色由红转白，复又由白翻"
              "红，伤势恢复了不少。\n" NOR;
        message_combatd(msg, me);

        neili_cost = rp + 100;
        if (neili_cost > my["neili"])
        {
                neili_cost = my["neili"];
                rp = neili_cost - 100;
        }
        me->receive_curing("qi", rp);
        me->receive_healing("qi", rp * 3 / 2);
        me->add("neili", -neili_cost);

        if (random(10) < 3)
        {
                tell_object(me, HIC "由于你过度的催动真元，导致你的内"
                                "力有所损耗。\n" NOR);
                me->add("max_neili", -1);
        }
        me->start_busy(3);
        return 1;
}
