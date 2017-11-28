#include <ansi.h>
#include <combat.h>

#define MANG "「" HIW "劈天神芒" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
 
        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/bagua-dao/mang"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(MANG "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对，难以施展" MANG "。\n");

        if (me->query_skill("force") < 200)
                return notify_fail("你的内功的修为不够，难以施展" MANG "。\n");

        if (me->query_skill("wai-bagua", 1) < 140)
                return notify_fail("你的外八卦神功修为不够，难以施展" MANG "。\n");

        if (me->query_skill("bagua-dao", 1) < 140)
                return notify_fail("你的八卦刀法修为不够，难以施展" MANG "。\n");

        if (me->query_skill_mapped("blade") != "bagua-dao")
                return notify_fail("你没有激发八卦刀法，难以施展" MANG "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你的真气不够，难以施展" MANG "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "脚踏八卦四方之位，陡然一振手中" + weapon->name() +
              HIW "，刀身顿时卷起阵阵雪亮刀芒，将$n" + HIW "团团裹住！\n" NOR;

        ap = me->query_skill("blade");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap);
                me->add("neili", -150);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 75,
                                           HIR "只听$n" HIR "一声惨叫，一蓬血雨自" HIR
                                           "亮白的刀芒中飞溅而出！\n" NOR);
        } else
        {
                me->add("neili", -60);
                me->start_busy(3);
                msg += CYN "可是$p" CYN "眼明手快，只听叮叮当当响起了一串"
                       CYN "刀鸣，$p" CYN "将$P" CYN "的招式全部挡开！\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
