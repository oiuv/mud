#include <ansi.h>
#include <combat.h>

#define YOU "「" HIG "古墓幽居" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
//      string pmsg;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/meinv-quan/you"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(YOU "只能对战斗中的对手使用。\n");

	if (me->query_temp("weapon"))
		return notify_fail("你必须空手才能施展" YOU "。\n");

        if ((int)me->query_skill("meinv-quan", 1) < 80)
                return notify_fail("你的美女拳法别不够，不会使用" YOU "。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功还未娴熟，不能使用" YOU "。\n");

        if ((int)me->query("neili") < 180)
                return notify_fail("你现在真气不够，不能使用" YOU "。\n");

        if (me->query_skill_mapped("unarmed") != "meinv-quan")
                return notify_fail("你没有激发美女拳法，不能施展" YOU "。\n");

        if (me->query_skill_prepared("unarmed") != "meinv-quan")
                return notify_fail("你没有准备美女拳法，难以施展" YOU "。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "\n$N" HIW "右手支颐，左袖轻轻挥出，长叹一声，使"
              "出古墓派绝学「古墓幽居」，一脸尽现寂寥之意。\n" NOR;

        if (random(me->query_skill("force")) > target->query_skill("force") / 2)
        {
                //me->start_busy(2 + random(2));
                me->start_busy(2);

                damage = (int)me->query_skill("unarmed");
                damage = damage / 2 + random(damage / 2);

                me->add("neili", -100);

                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 45, 
                                           HIR "但见$N" HIR "双拳袭来，柔中带刚，迅"
                                           "猛无比，其间仿佛蕴藏着无穷的威力，$n" HIR
                                           "正迟疑间， $N" HIR "却已中拳，闷哼一声，倒"
                                           "退几步，一口鲜血喷出。\n" NOR);
        } else
        {
                me->start_busy(3);
                msg += CYN "可是$p" CYN "看破了$P" CYN
                       "的企图，稳如泰山，抬手一架格开了$P"
                       CYN "这一拳。\n"NOR;
        }
        message_sort(msg, me, target);

        return 1;
}