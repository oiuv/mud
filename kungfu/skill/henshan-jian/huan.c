#include <ansi.h>
#include <combat.h>

#define HUAN "「" HIW "幻剑式" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg, wn;
        object weapon;
        int ap, dp;
  
        me = this_player();

        if (userp(me) && ! me->query("can_perform/henshan-jian/huan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(HUAN "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" HUAN "。\n");

        if ((int)me->query_skill("henshan-jian", 1) < 60)
                return notify_fail("你衡山剑法不够娴熟，难以施展" HUAN "。\n");

        if (me->query_skill_mapped("sword") != "henshan-jian")
                return notify_fail("你没有激发衡山剑法，难以施展" HUAN "。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候不够，难以施展" HUAN "。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你现在的真气不够，难以施展" HUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wn = weapon->name();
                           
        msg = HIC "\n$N" HIC "将真气运于剑身，身法陡然加快，手中" + wn +
              HIC "剑随人动，霎那间剑光四散，如梦如幻，像有无数柄" + wn +
              HIC "一齐袭向$n" HIC "。" NOR;

        message_sort(msg, me, target);

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 3 + random(ap / 2);
         	msg = COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 10,
                                          HIR "$n" HIR "看得眼花缭乱，却分不清"
                                          "剑的来路，肩膀已被" + wn + HIR "刺出"
                                          "一个窟窿。\n" NOR);
         	me->start_busy(2);
         	me->add("neili", -50);
        } else
        {
         	msg = CYN "然而$n" CYN "并未受幻象所困，侧身一跳"
                      "躲过$N" CYN "这一剑。\n" NOR;

         	me->start_busy(2);
         	me->add("neili", -30);
        }
        message_combatd(msg, me, target);

        return 1;
}



