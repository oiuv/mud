#include <ansi.h>
#include <combat.h>

#define HAO "「" HIW "皓月穿空" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg, wn;
        object weapon;
        int ap, dp;
  
        me = this_player();

        if (userp(me) && ! me->query("can_perform/chuanyue/hao"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(HAO "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" HAO "。\n");

        if ((int)me->query_skill("chuanyue-jian", 1) < 120)
                return notify_fail("你紫雷剑法不够娴熟，难以施展" HAO "。\n");

        if (me->query_skill_mapped("sword") != "chuanyue-jian")
                return notify_fail("你没有激发紫雷剑法，难以施展" HAO "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，难以施展" HAO "。\n");

        if ((int)me->query("neili") < 400)
                return notify_fail("你现在的真气不够，难以施展" HAO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wn = weapon->name();
                           
        msg = HIY "\n$N" HIY "将手中" + wn + HIY "反转几周，然后"
              "猛地腾空而起，施出绝招「" HIW "皓月穿空" HIY "」，"
              "“皓月荧荧挂长空，利剑盈盈斩群雄。”。手中剑光瀑"
              "涨，气势磅礴，半空直下，袭向$n\n " HIY "。" NOR;

        message_sort(msg, me, target);

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap / 2);
         	msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 48,
                                          HIR "$n" HIR "只见一道剑光从半空袭来，"
                                          "心中惊骇不已，但鲜血已从$n胸口喷出。\n" 
                                          NOR);
         	me->start_busy(2 + random(4));
         	me->add("neili", -200);
        } else
        {
         	msg = CYN "然而$n" CYN "眼明手快，侧身一跳"
                      "躲过$N" CYN "这一剑。\n" NOR;

         	me->start_busy(2);
         	me->add("neili", -180);
        }
        message_vision(msg, me, target);

        return 1;
}



