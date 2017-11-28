#include <ansi.h>
#include <combat.h>

#define SHA "「" HIR "无痕杀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
 
        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/shiying-lianhuan/sha"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(SHA "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对，难以施展" SHA "。\n");

        if (me->query_skill("force") < 200)
                return notify_fail("你的内功修为不够，难以施展" SHA "。\n");

        if (me->query_skill("shiying-lianhuan", 1) < 150)
                return notify_fail("你弑鹰九连环修为不够，难以施展" SHA "。\n");

        if (me->query_skill_mapped("blade") != "shiying-lianhuan")
                return notify_fail("你没有激发弑鹰九连环，难以施展" SHA "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你现在的真气不足，难以施展" SHA "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "回转手中" + weapon->name() + HIR "施出「" NOR +
              RED "无痕杀" HIR "」绝技，刀身顿时漾起一道血色刀芒，直斩$n"
              HIR "而去！\n" NOR;

        ap = me->query_skill("blade");
        dp = target->query_skill("dodge");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap);
                me->add("neili", -250);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 70,
                                           HIR "只听“嗤啦”一声，$n" HIR "被$N"
                                           HIR "的刀芒划中气门，登时痛声长呼，几"
                                           "欲晕倒。\n" NOR);
        } else
        {
                me->add("neili", -100);
                me->start_busy(4);
                msg += CYN "$n" CYN "见$P" CYN "来势汹涌，连忙飞"
                       "身向后挪移数尺，躲闪开来。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
