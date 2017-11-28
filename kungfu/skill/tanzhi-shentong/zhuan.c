#include <ansi.h>
#include <combat.h>

#define ZHUAN "「" HIR "转乾坤" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
//      object weapon;
        int ap, dp, damage;
        string msg;

        if (userp(me) && ! me->query("can_perform/tanzhi-shentong/zhuan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHUAN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(ZHUAN "只能空手施展。\n");

        if ((int)me->query_skill("tanzhi-shentong", 1) < 220)
                return notify_fail("你的弹指神通不够娴熟，难以施展" ZHUAN "。\n");

        if ((int)me->query_skill("qimen-wuxing", 1) < 200)
                return notify_fail("你的奇门五行修为不够，难以施展" ZHUAN "。\n");
 
        if (me->query_skill_mapped("finger") != "tanzhi-shentong")
                return notify_fail("你没有激发弹指神通，难以施展" ZHUAN "。\n");

        if (me->query_skill_prepared("finger") != "tanzhi-shentong")
                return notify_fail("你没有准备弹指神通，难以施展" ZHUAN "。\n");

        if (me->query("max_neili") < 3500)
                return notify_fail("你的内力修为不足，难以施展" ZHUAN "。\n");

        if (me->query("neili") < 800)
                return notify_fail("你现在的真气不够，难以施展" ZHUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIC "$N" HIC "将全身功力聚于一指，指劲按照二十八宿方位云贯而出，正"
              "是桃花岛「" HIR "转乾坤" HIC "」绝技。\n" NOR;

        ap = me->query_skill("finger", 1) +
             me->query_skill("qimen-wuxing", 1) +
             me->query_skill("tanzhi-shentong", 1);

        dp = target->query_skill("force",1) +
             target->query_skill("parry", 1) +
             target->query_skill("qimen-wuxing", 1);

        if (ap / 2 + random(ap) > dp)
        {
                damage = 0;
                if (me->query("max_neili") > target->query("max_neili") * 2)
                {
                	me->start_busy(2);
                        msg += HIR "霎那间$n" HIR "只见寒芒一闪，$N" HIR "食指"
                               "已钻入$p" HIR "印堂半尺，指劲顿时破脑而入。\n"
                               HIW "你听到“噗”的一声，身上竟然溅到几滴脑浆！"
                               "\n" NOR "( $n" RED "受伤过重，已经有如风中残烛"
                               "，随时都可能断气。" NOR ")\n";
                        damage = -1;
                } else
		{
                	me->start_busy(3);
                	damage = ap / 2 + random(ap);
                	me->add("neili", -500);
                	msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 100,
                        	                   HIR "霎那间$n" HIR "只见寒芒一闪，$N"
                                                   HIR "食指已钻入$p" HIR "胸堂半尺，指劲"
                                                   "顿时破体而入。\n你听到“嗤”的一声，"
                                                   "身上竟然溅到几滴鲜血！\n" NOR);
		}
        } else
        {
                me->start_busy(2);
                me->add("neili", -300);
                msg += CYN "$p" CYN "见$P" CYN "招式奇特，不感大"
                       "意，顿时向后跃数丈，躲闪开来。\n" NOR;
        }
        message_combatd(msg, me, target);

        if (damage < 0)
                target->die(me);

        return 1;
}