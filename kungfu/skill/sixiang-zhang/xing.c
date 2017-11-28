#include <ansi.h>
#include <combat.h>

#define XING "「" HIW "星罗棋布" NOR "」"

inherit F_SSERVER;
 
int perform(object me)
{
        string msg;
        object weapon, target;
        int skill, ap, dp, damage;

        if (userp(me) && ! me->query("can_perform/sixiang-zhang/xing"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(XING "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(XING "只能空手施展。\n");

        skill = me->query_skill("sixiang-zhang", 1);

        if (skill < 60)
                return notify_fail("你的四象掌法等级不够，难以施展" XING "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你的真气不够，难以施展" XING "。\n");
 
        if (me->query_skill_mapped("strike") != "sixiang-zhang")
                return notify_fail("你没有激发四象掌法，难以施展" XING "。\n");

        if (me->query_skill_prepared("strike") != "sixiang-zhang")
                return notify_fail("你现在没有准备使用四象掌法，无法使用" XING "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "一声清啸，双掌纷飞贯出，掌影重重叠叠，虚实难"
              "辨，全全笼罩$n" HIW "全身。\n" NOR;

        ap = me->query_skill("strike");
        dp = target->query_skill("parry");
        if (ap / 2 + random(ap) > dp)
        {
                me->add("neili", -80);
                damage = ap / 3 + random(ap / 3);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 10,
                                           HIR "$n" HIR "一时无法勘破这玄奇的掌法"
                                           "，接连中了数招，身陷其中，无法自拔。\n"
                                           NOR);
                me->start_busy(2);
                if (ap / 2 + random(ap) > dp && ! target->is_busy())
                        target->start_busy(ap / 60 + 1);
        } else
        {
                msg += CYN "可是$p" CYN "的看破了$P" CYN
                       "的掌法，巧妙的拆招，没露半点破绽"
                       "。\n" NOR;
                me->add("neili", -50);
                me->start_busy(3);
        }
        message_combatd(msg, me, target);

        return 1;
}
