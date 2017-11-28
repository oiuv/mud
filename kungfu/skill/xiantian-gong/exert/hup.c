// hup.c 五气朝元

#include <ansi.h>

#define HUP "「" HIR "五气朝元" NOR "」"

inherit F_CLEAN_UP;

int exert(object me, object target)
{
        int skill;
        string msg;
        mapping my;
        int rp;
        int neili_cost;

        if (userp(me) && ! me->query("can_perform/xiantian-gong/hup"))
                return notify_fail("你所学的内功中没有这种功能。\n");

        if ((int)me->query_skill("xiantian-gong", 1) < 200)
                return notify_fail("你先天功不够深厚，难以施展" HUP "。\n");

        if ((int)me->query("max_neili") < 1000) 
                return notify_fail("你的内力修为不足，难以施展" HUP "。\n");

        if ((int)me->query("neili") < 200) 
                return notify_fail("你现在的真气不够，难以施展" HUP "。\n");

        my = me->query_entire_dbase();
        if ((rp = (my["max_qi"] - my["eff_qi"])) < 1)
                return (SKILL_D("force") + "/recover")->exert(me, target);

        if (rp >= my["max_qi"] / 10)
                rp = my["max_qi"] / 10;

        skill = me->query_skill("force");
        msg = HIW "$N" HIW "缓缓吐出一口气，顿时气脉通畅，脸色渐渐的变"
              "得平和。\n" NOR;
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

        me->start_busy(3);
        return 1;
}
