#include <ansi.h>
#include <combat.h>

#define GUA "「" HIM "劈卦八卦拳" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/bagua-quan/gua"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(GUA "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(GUA "只能空手施展。\n");

        if ((int)me->query_skill("bagua-quan", 1) < 70)
                return notify_fail("你的八卦拳法不够娴熟，难以施展" GUA "。\n");

        if (me->query_skill_mapped("cuff") != "bagua-quan") 
                return notify_fail("你没有激发八卦拳法，难以施展" GUA "。\n");

        if (me->query_skill_prepared("cuff") != "bagua-quan") 
                return notify_fail("你没有准备八卦拳法，难以施展" GUA "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在真气不够，难以施展" GUA "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIM "$N" HIM "突然身体一侧，双掌向下一沉，忽又向上一翻，朝着$n"
              HIM "的双肩斜斜地劈去！\n" NOR;

        ap = me->query_skill("cuff");
        dp = target->query_skill("parry");
        if (ap / 2 + random(ap) > dp)
        {
                damage = 50 + ap / 2 + random(ap / 2);
                me->add("neili", -100);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 20,
                                           HIR "只因这招实在太过巧妙，$p" HIR "被"
                                           "$P" HIR "攻了个措手不及，大叫一声，吐"
                                           "出一口鲜血！\n" NOR);
                me->start_busy(2);
        } else 
        {
                msg += CYN "可是$p" CYN "看破了$P" CYN
                       "的这一招，镇定解招，一丝不乱。"
                       "\n" NOR;
                me->add("neili", -50);
                me->start_busy(3);
        }
        message_combatd(msg, me, target);

        return 1;
}
