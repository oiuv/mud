#include <ansi.h>
#include <combat.h>

#define LUAN "「" HIM "乱剑覆花" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg, wn;
        object weapon;
        int ap, dp;

        me = this_player();

        if (userp(me) && ! me->query("can_perform/furong-jian/luan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(LUAN "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" LUAN "。\n");

        if ((int)me->query_skill("furong-jian", 1) < 100)
                return notify_fail("你芙蓉剑法不够娴熟，难以施展" LUAN "。\n");

        if (me->query_skill_mapped("sword") != "furong-jian")
                return notify_fail("你没有激发芙蓉剑法，难以施展" LUAN "。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功火候不够，难以施展" LUAN "。\n");

        if ((int)me->query_skill("dodge") < 120)
                return notify_fail("你的轻功火候不够，难以施展" LUAN "。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你现在的真气不够，难以施展" LUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wn = weapon->name();

        msg = HIM "\n$N" HIM "轻啸一声，腾空而起，" + wn + "在空中挽出一个剑"
              HIM "花，顷刻间剑花四散，洋洋洒洒。\n犹如无数花瓣从半空洒向$n"
              HIM "全身。" NOR;

        message_sort(msg, me, target);

        ap = me->query_skill("furong-jian", 1);
        dp = target->query_skill("dodge", 1);

        if (random(ap) >= random(dp / 3))
        {
         	damage = me->query_skill("furong-jian", 1);
         	damage += random(damage / 3);

         	msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 60,
                                           HIR "$n" HIR "只见无数剑花袭来，将自己包围"
                                           "住，正犹豫间，$n" HIR "已被" + wn + HIR 
                                           "刺得皮开肉绽。\n" NOR);
         	me->start_busy(3);
         	me->add("neili", -100);
        } else
        {
         	msg = CYN "然而$n" CYN "看出其中的破绽，侧身一跳"
                      "已然躲过$N" CYN "这一剑。\n" NOR;

       		me->start_busy(3);
         	me->add("neili", -100);
        }
        message_combatd(msg, me, target);

        return 1;
}
