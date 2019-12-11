#include <ansi.h>
#include <combat.h>

#define XUE "「" HIW "天下有" HIR "血" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string type, msg;
        object weapon;
        int i, count;
        int ap, dp;

        if (me->query_skill("daojian-guizhen", 1) < 200)
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! me->is_fighting(target))
                return notify_fail(XUE "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword"
           && (string)weapon->query("skill_type") != "blade" )
                return notify_fail("你所使用的武器不对，难以施展" XUE "。\n");

        type = weapon->query("skill_type");

        if (me->query_skill(type, 1) < 250)
                return notify_fail("你的" + to_chinese(type) + "太差，"
                                   "难以施展" XUE "。\n");

        if (me->query_skill_mapped(type) != "daojian-guizhen")
                return notify_fail("你没有激发刀剑归真，难以施展" XUE "。\n");

        if (me->query_skill("daojian-guizhen", 1) < 250)
                return notify_fail("你的刀剑归真等级不够，难以施展" XUE "。\n");

        if (me->query("neili") < 500)
                return notify_fail("你现在的真气不够，难以施展" XUE "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "手中" + weapon->name() + HIW "蓦地一抖"
              "，将「" NOR + WHT "胡家刀法" HIW "」并「" NOR + WHT
              "苗家剑法" HIW "」连环施出。霎时寒\n光点点，犹如夜陨"
              "划空，铺天盖地罩向$n" HIW "，正是一招「" HIW "天下"
              "有" HIR "血" HIW "」。\n" NOR;

        ap = me->query_skill("daojian-guizhen", 1) * 3 / 2 +
             me->query_skill("martial-cognize", 1);

        dp = target->query_skill("parry") +
             target->query_skill("martial-cognize", 1);

        if (ap / 2 + random(ap) > dp)
        {
                msg += HIW "$n" HIW "只见无数刀光剑影向自己逼"
                       "来，顿感眼花缭乱，心底寒意油然而生。\n" NOR;
                count = ap / 6;
                me->set_temp("daojian-guizhen/max_pfm", 1);
        } else
        {
                msg += HIG "$n" HIG "突然发现自己四周皆被刀光"
                       "剑影所包围，心知不妙，急忙小心招架。\n" NOR;
                count = ap / 12;
        }
        message_combatd(msg, me, target);

        me->add("neili", -300);
        me->add_temp("apply/attack", count);
        me->add_temp("apply/damage", count * 2 / 3);

        for (i = 0; i < 9; i++)
        {
                if (! me->is_fighting(target))
                        break;

                COMBAT_D->do_attack(me, target, weapon, 0);
        }
        me->add_temp("apply/attack", -count);
        me->add_temp("apply/damage", -count * 2 / 3);
        me->delete_temp("daojian-guizhen/max_pfm");
        me->start_busy(1 + random(8));
        return 1;
}
