#include <ansi.h>
#include <combat.h>

#define YIN "「" HIY "金刚印" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int skill, ap, dp, damage;

        if (userp(me) && ! me->query("can_perform/dashou-yin/yin"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! me->is_fighting(target))
                return notify_fail(YIN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(YIN "只能空手施展。\n");

        skill = me->query_skill("dashou-yin", 1);

        if (skill < 100)
                return notify_fail("你的大手印修为不够，难以施展" YIN "。\n");

        if (me->query("neili") < 150)
                return notify_fail("你的真气不够，难以施展" YIN "。\n");

        if (me->query_skill_mapped("hand") != "dashou-yin")
                return notify_fail("你没有激发大手印，难以施展" YIN "。\n");

        if (me->query_skill_prepared("hand") != "dashou-yin")
                return notify_fail("你没有准备大手印，难以施展" YIN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "面容庄重，单手携着劲风朝$n" HIY "猛然拍出，正"
              "是密宗绝学「金刚印」。\n" NOR;

        ap = me->query_skill("hand", 1) / 2 + skill;
        dp = target->query_skill("parry");
        if (dp < 1) dp = 1;
        if (ap / 2 + random(ap * 4 / 5) > dp)
        {
                me->add("neili", -100);
                me->start_busy(2);
                damage = 10 + skill / 3 + random(skill / 2);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 30,
                                           HIR "结果$p" HIR "招架不及，被$P" HIR
                                           "这一下打得七窍生烟，吐血连连。\n" NOR);
        } else
        {
                me->add("neili",-40);
                msg += CYN "可是$p" CYN "不慌不忙，巧妙的架开了$P"
                       CYN "的金刚印。\n" NOR;
                me->start_busy(3);
        }
        message_combatd(msg, me, target);

        return 1;
}

