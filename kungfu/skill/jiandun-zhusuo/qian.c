#include <ansi.h>
#include <combat.h>

#define QIAN "「" HIW "千头万绪" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        object weapon;
        string wname;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/jiandun-zhusuo/qian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(QIAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对，难以施展" QIAN "。\n");

        if (me->query_skill("force") < 180)
                return notify_fail("你的内功的修为不够，难以施展" QIAN "。\n");

        if (me->query_skill("jiandun-zhusuo", 1) < 120)
                return notify_fail("你的剑盾珠索修为不够，难以施展" QIAN "。\n");

        if (me->query("neili") < 400)
                return notify_fail("你的真气不够，难以施展" QIAN "。\n");

        if (me->query_skill_mapped("whip") != "jiandun-zhusuo")
                return notify_fail("你没有激发剑盾珠索，难以施展" QIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wname = weapon->name();

        damage = me->query_skill("jiandun-zhusuo", 1) / 4;
        damage += random(damage / 4);

        ap = me->query_skill("whip");
        dp = target->query_skill("parry");

        msg = HIW "$N" HIW "一声轻哼，右手横挥，手中" + wname +
              HIW "一招「千头万绪」对准$n" HIW "乱点下来。\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 10,
                                           HIR "$p" HIR "抽身回退，却已然不及，被"
                                           "$P" HIR "这招点中要穴，顿时口喷鲜血！\n"
                                           NOR);
        } else
        {
                msg += CYN "$p" CYN "凝神聚气，硬声声将$P"
                       CYN "这一鞭架开，丝毫无损。\n" NOR;
        }

        ap = me->query_skill("whip");
        dp = target->query_skill("dodge");

        msg += "\n" HIW "却见$N" HIW "跨步上前，手中" + wname +
               HIW "招数一变，反转鞭鞘，抽向$n" HIW "而去。\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 10,
                                           HIR "便在$p" HIR "微微一楞间，已被$P"
                                           HIR "这招抽中，鲜血四处飞溅！\n" NOR);
        } else
        {
                msg += CYN "可是$p" CYN "急忙猛吸一口气，飞"
                       "身跃起，躲开了这一招。\n" NOR;
        }

        ap = me->query_skill("whip");
        dp = target->query_skill("force");

        msg += "\n" HIW "紧接着又见$N" HIW "纵身而起，单手将" + wname +
               HIW "急速舞动，凌空朝着$n" HIW "圈去。\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 10,
                                           HIR "顿时便听“啪”的一声闷响，$n" HIR
                                           "竟被" + wname + HIR "卷至半空，重重"
                                           "摔下，再也无力爬起！\n" NOR);
        } else
        {
                msg += CYN "可$p" CYN "一个翻滚，起身时已在"
                       "丈许开外，便将这式化解于无形。\n" NOR;
        }
        me->start_busy(3 + random(3));
        me->add("neili", -300);
        message_combatd(msg, me, target);
        return 1;
}
