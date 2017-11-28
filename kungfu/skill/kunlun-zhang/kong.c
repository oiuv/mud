#include <ansi.h>
#include <combat.h>

#define KONG "「" HIR "日入空山" NOR "」"

inherit F_SSERVER;
 
int perform(object me)
{
        string msg;
        object /*weapon,*/ target;
        int skill, ap, dp, damage;

        if (userp(me) && ! me->query("can_perform/kunlun-zhang/kong"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(KONG "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") && me->query_temp("secondary_weapon"))
                return notify_fail("你两只手都拿着武器，怎么施展" KONG "？\n");

        skill = me->query_skill("kunlun-zhang", 1);

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if (skill < 120)
                return notify_fail("你昆仑掌法等级不够，难以施展" KONG "。\n");
 
        if (me->query_skill_mapped("strike") != "kunlun-zhang")
                return notify_fail("你没有激发昆仑掌法，难以施展" KONG "。\n");

        if (me->query_skill_prepared("strike") != "kunlun-zhang")
                return notify_fail("你没有准备昆仑掌法，难以施展" KONG "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" KONG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "陡然施出昆仑掌法绝技「" NOR + HIR "日入空山"
              NOR + HIW "」，一掌猛然拍出，掌影重重叠叠，笼罩$n" HIW "四"
              "面八方。\n" NOR;

        ap = me->query_skill("strike");
        dp = target->query_skill("parry");
        if (ap / 2 + random(ap) > dp)
        {
                me->add("neili", -150);
                damage = ap / 3 + random(ap / 3);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 20,
                                           HIR "$n" HIR "只见$P" HIR "的无数掌影"
                                           "向自己压来，一时不知该如何抵挡，顿时"
                                           "连中数招，无暇反击。\n" NOR);
                me->start_busy(1);
                target->start_busy(ap / 30 + 2);
        } else
        {
                msg += CYN "可是$p" CYN "的看破了$P" CYN
                       "的企图，巧妙的拆招，没露半点破绽"
                       "。\n" NOR;
                me->add("neili", -80);
                me->start_busy(3);
        }
        message_combatd(msg, me, target);

        return 1;
}
