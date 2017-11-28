#include <ansi.h>
#include <combat.h>

#define XIAN "「" HIY "镖中现掌" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object anqi;
        int damage;
        string msg;
        int ap, dp;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/bagua-biao/xian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(XIAN "只能在战斗中对对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail(XIAN "只能空手施展。\n");

        if (! objectp(anqi = me->query_temp("handing"))
           || (string)anqi->query("skill_type") != "throwing")
                return notify_fail("你现在手中并没有拿着暗器。\n");

        if (me->query_skill_mapped("strike") != "bagua-zhang") 
                return notify_fail("你没有激发八卦掌，难以施展" XIAN "。\n");

        if (me->query_skill_prepared("strike") != "bagua-zhang") 
                return notify_fail("你没有准备八卦掌，难以施展" XIAN "。\n");

        if (me->query_skill_mapped("throwing") != "bagua-biao") 
                return notify_fail("你没有激发八卦镖诀，难以施展" XIAN "。\n");

        if ((int)me->query_skill("bagua-zhang", 1) < 120)
                return notify_fail("你的八卦掌不够娴熟，难以施展" XIAN "。\n");

        if ((int)me->query_skill("bagua-biao", 1) < 120)
                return notify_fail("你的八卦镖诀不够娴熟，难以施展" XIAN "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，难以施展" XIAN "。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你现在真气不足，难以施展" XIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "突然只听$N" HIY "喝道：“$n" HIY "看招！”"
              "说完单手一扬，袖底顿时窜出一道金光，直射$n" HIY
              "而去！\n" NOR;

        ap = me->query_skill("strike", 1) +
             me->query_skill("throwing");

        dp = target->query_skill("dodge", 1) +
             target->query_skill("parry", 1);

        me->start_busy(3);
        if (anqi->query_amount() > 0)anqi->add_amount(-1);

        if (ap / 2 + random(ap) > dp)
        { 
                damage = ap / 3 + random(ap / 2);
                me->add("neili", -100);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 30,
                                           HIY "可只见$n" HIY "哈哈一笑，身子一矮"
                                           "，躲了过去。\n" NOR + HIR "哪知方才的"
                                           "暗器竟是虚招，等$p" HIR "反应时$N" HIR
                                           "已至跟前，双掌齐施，重重的印在$n" HIR
                                           "胸前。\n" NOR);
        } else
        {
                msg += HIY "可是$p" HIY "看破了$P" HIY "的企图，没"
                       "有受到迷惑，招手将暗器全部揽了下来。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
