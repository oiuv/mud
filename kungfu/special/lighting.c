// lighting.c 连锁闪电
// Created by Vin 8/5/2002

#include <ansi.h>
#include <combat.h>

inherit F_CLEAN_UP;
inherit F_SSERVER;

string name() { return HIW "連鎖閃電" NOR; }

#define LIGHTING "「" HIW "連鎖閃電" NOR "」"

int perform(object me, object target)
{
        string msg;
        int damage;

        if (! wizardp(me) && me->query("id") != "ivy")
                return notify_fail(LIGHTING "只能由巫师施展。\n");

        if (! me->is_fighting())
                return notify_fail(LIGHTING "只能对战斗中的对手使用。\n");

        target = me->select_opponent();

        if (! target || ! target->is_character()
           || target->query("not_living"))
                return notify_fail("你打算对谁施展" LIGHTING  "？\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = WHT "$N" WHT "施展法術「" HIW "連鎖閃電" NOR +
              WHT "」，高聲念誦道：比迪姆·亞特蒙·泰里阿普·埃控。\n" NOR;

        me->start_busy(1);

        if (wiz_level(target) <= wiz_level(me)
           && target->query("id") != "ivy")
        {
                damage = 8000 + random(8000);
                target->receive_wound("qi", damage, me);
                target->receive_wound("jing", damage / 2, me);

                msg += HIW "霎時只見數道閃電從天而降，盡數劈在$n"
                       HIW "身上，直劈得$n" HIW "七竅生煙、血肉四濺。\n" NOR;
        } else
        {
                msg += HIW "霎時只見數道閃電從天而降，盡數劈在$n"
                       HIW "身上，青煙散過，$n" HIW "卻是一點事情也沒有。\n" NOR;
        }
        message_combatd(msg, me, target);
        me->want_kill(target);

        if (! target->is_killing(me))
                target->kill_ob(me);
        return 1;
}
