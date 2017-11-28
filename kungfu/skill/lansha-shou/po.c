#include <ansi.h>
#include <combat.h>

#define PO "「" HIB "破靛神砂" NOR "」"

inherit F_SSERVER;

string final(object me, object target, int damage);

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;
        int lvl;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/lansha-shou/po"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(PO "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail(PO "只能空手施展。\n");

        if ((int)me->query_skill("lansha-shou", 1) < 100)
                return notify_fail("你蓝砂手不够熟练，难以施展" PO "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内力修为不足，难以施展" PO "。\n");

        if (me->query_skill_mapped("hand") != "lansha-shou")
                return notify_fail("你没有激发蓝砂手，难以施展" PO "。\n");

        if (me->query_skill_prepared("hand") != "lansha-shou")
                return notify_fail("你没有准备蓝砂手，难以施展" PO "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在的真气不足，难以施展" PO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIG "$N" HIG "身形急转，宛若鬼魅，悄然施出蓝砂手绝技「" NOR +
              HIB "破靛神砂" NOR + HIG "」，朝$n" HIG "胸前大穴抓落！\n" NOR;

        lvl = me->query_skill("lansha-shou", 1);

        ap = me->query_skill("hand");
        dp = target->query_skill("force");

        me->start_busy(3);
        if (ap / 2 + random(ap) > dp)
        { 
                damage = ap / 2 + random(ap / 3);
                me->add("neili", -100);

                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 20,
                                          (: final, me, target, damage :));
        } else
        {
                msg += CYN "$n" CYN "见$N"
                       CYN "来势汹涌，奋力格挡，终于化解开来。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}

string final(object me, object target, int damage)
{
        int lvl = me->query_skill("lansha-shou", 1) / 2 * 3;

        target->affect_by("sha_poison",
                ([ "level"    : me->query("jiali") + random(me->query("jiali")),
                   "id"       : me->query("id"),
                   "duration" : lvl / 50 + random(lvl / 30) ]));

        return HIR "$n" HIR "闪避不及，登被$N" HIR
               "抓出五道血痕，伤口竟渗出黑血，隐隐"
               "发着磷光。\n" NOR;
}

