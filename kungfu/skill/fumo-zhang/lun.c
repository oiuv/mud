#include <ansi.h>
#include <combat.h>

#define LUN "「" HIR "风火轮" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp, damage;
 
        if (userp(me) && ! me->query("can_perform/fumo-zhang/lun"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(LUN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "staff")
                return notify_fail("你使用的武器不对，难以施展" LUN "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，难以施展" LUN "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在的真气不够，难以施展" LUN "。\n");

        if ((int)me->query_skill("fumo-zhang", 1) < 120)
                return notify_fail("你二十四路伏魔杖火候不够，难以施展" LUN "。\n");

        if (me->query_skill_mapped("staff") != "fumo-zhang") 
                return notify_fail("你没有激发二十四路伏魔杖，难以施展" LUN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "一声暴喝，手中" + weapon->name() +
              HIW "狂舞，残影化作无数大圈，宛若" HIR "风火轮"
              HIW "般铺天盖地卷向$n" HIW "。\n" NOR;

        ap = me->query_skill("staff");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap / 2);

                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 30,
                                           HIR "$n" HIR "完全无法看清招中虚实，只"
                                           "听「砰砰砰」几声，已被$N" HIR "击中数"
                                           "杖，呕血连连！\n" NOR);
                me->start_busy(3);
                me->add("neili", -150);
        } else 
        {
                msg += CYN "可是$n" CYN "奋力招架，左闪右避，好不容"
                       "易抵挡住了$N" CYN "的攻击。\n" NOR;
                me->start_busy(4);
                me->add("neili", -80);
        }
        message_combatd(msg, me, target);

        return 1;
}
