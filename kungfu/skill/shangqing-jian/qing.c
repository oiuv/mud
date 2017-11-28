#include <ansi.h>
#include <combat.h>

#define QING "「" HIG "清流剑" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        object weapon;
        string wname;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/shangqing-jian/qing"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(QING "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" QING "。\n");

        if (me->query_skill("force") < 220)
                return notify_fail("你的内功的修为不够，难以施展" QING "。\n");

        if (me->query_skill("shangqing-jian", 1) < 160)
                return notify_fail("你的上清剑法修为不够，难以施展" QING "。\n");

        if (me->query("neili") < 400)
                return notify_fail("你的真气不够，难以施展" QING "。\n");

        if (me->query_skill_mapped("sword") != "shangqing-jian")
                return notify_fail("你没有激发上清剑法，难以施展" QING "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wname = weapon->name();

        damage = (int)me->query_skill("shangqing-jian", 1) / 2;
        damage += random(damage / 3);

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");
        msg = HIG "$N" HIG "施出上清剑法「清流剑」绝技，手中" + wname +
              HIG "随即一颤，对准$n" HIG "连攻数剑，招式凌厉无比！\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 10,
                                           HIR "$p" HIR "奋力抵挡，却哪里招架得住，被$P"
                                           HIR "这一剑刺中要脉，鲜血四处飞溅！\n" NOR);
        } else
        {
                msg += CYN "$p" CYN "凝神聚气，硬声声将$P"
                       CYN "这一剑架开，丝毫无损。\n" NOR;
        }

        ap = me->query_skill("sword");
        dp = target->query_skill("dodge");
        msg += "\n" HIG "却见$N" HIG "跨步上前，手中" + wname +
               HIG "剑招陡变，又攻出一剑，剑尖顿闪出数道剑光，"
               "笼罩$n" HIG "全身！\n" NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 20,
                                           HIR "$p" HIR "只觉眼花缭乱，一时难以勘透其"
                                           "中奥妙，连中数剑，被削得血肉模糊！\n" NOR);
        } else
        {
                msg += CYN "可是$p" CYN "丝毫不为$P"
                       CYN "华丽的剑光所动，稳稳将这一剑架开。\n" NOR;
        }

        ap = me->query_skill("sword");
        dp = target->query_skill("force");
        msg += "\n" HIG "$N" HIG "随即一声大喝，身外化身，剑外化剑，手中"
               + wname + HIG "顿时漾起一道青芒，再次攻向$n" HIG "而去！\n"
               NOR;
        if (ap / 2 + random(ap) > dp)
        {
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 30,
                                           HIR "$p" HIR "运气抵挡，可只觉一股无形剑气"
                                           "透体而过，难受之极，喷出数口鲜血！\n" NOR);
        } else
        {
                msg += CYN "$p" CYN "一口气自丹田运了上来，$P"
                CYN "附体剑芒虽然厉害，却未能伤$p" CYN "分毫。\n" NOR;
        }
        me->start_busy(2 + random(3));
        me->add("neili", -300);
        message_combatd(msg, me, target);
        return 1;
}
