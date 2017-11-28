#include <ansi.h>
#include <combat.h>

#define XIAO "「" HIW "剑气冲霄" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg, wn;
        object weapon;
        int ap, dp;
  
        me = this_player();

        if (userp(me) && ! me->query("can_perform/lingyun-jian/xiao"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(XIAO "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" XIAO "。\n");

        if ((int)me->query_skill("lingyun-jian", 1) < 120)
                return notify_fail("你凌云剑法不够娴熟，难以施展" XIAO "。\n");

        if (me->query_skill_mapped("sword") != "lingyun-jian")
                return notify_fail("你没有激发凌云剑法，难以施展" XIAO "。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功火候不够，难以施展" XIAO "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在的真气不够，难以施展" XIAO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wn = weapon->name();
                           
        msg = HIW "\n$N" HIW "长叹一声，语调宛然，忽然右手斜指长"
              "空，手中" + wn + HIW "寒光闪闪，猛然间使出绝"
              "招「" HIY "剑气冲霄" HIW "」，刹时间剑风凌厉"
              "，" + wn + HIW "以直冲云霄之势，斩向$n\n" HIW "。" NOR;

        message_sort(msg, me, target);

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap / 2);
         	msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 40,
                                          HIR "$n" HIR "只见一道金光闪过，心中" 
                                          "惊骇不已，但鲜血已从$n胸口喷出。\n" 
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



