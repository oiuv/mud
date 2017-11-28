// shendao.c  血刀「祭血神刀」

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        object weapon;

        if (userp(me) && ! me->query("can_perform/xue-dao/shendao"))
                return notify_fail("你还不会使用「祭血神刀」！\n");

        if (! target)
                target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail("「祭血神刀」只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("装备刀才能使用「祭血神刀」！\n");

        if ((int)me->query_skill("xue-dao", 1) < 100)
                return notify_fail("你血刀刀法不够娴熟，使不出「祭血神刀」。\n");

        if ((int)me->query_skill("force") < 100 )
                return notify_fail("你内功火候不够，难以施展「祭血神刀」。\n");

        if ((int)me->query("max_neili") < 1200)
                return notify_fail("你的内力修为不足，无法运足内力。\n");

        if ((int)me->query("neili") < 400)
                return notify_fail("你现在真气不够，无法将「祭血神刀」使完！\n");

        if ((int)me->query("qi") < 100)
                return notify_fail("你还敢使这招？找死啊！\n");

        if ((int)me->query("shen") > -1000)
                return notify_fail("你为人不够凶残，还无法领会「祭血神刀」的奥妙。\n");

        if (me->query_skill_mapped("blade") != "xue-dao")
                return notify_fail("你没有激发血刀刀法，不能使用「祭血神刀」。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "右手持刀向左肩一勒，一阵血珠溅满刀面，紧接着右臂抡出，一片血光"
              "裹住刀影向$n" HIR "当头劈落，\n" NOR;

        if (random(me->query_skill("blade")) > (int)target->query_skill("force") / 2)
        {
                damage = me->query_skill("blade");
                damage = damage / 2 + random(damage / 2);
                if (me->query("character") == "心狠手辣")
                        damage += damage * 3 / 10;
                me->add("neili", -350);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 70,
                                           HIR "$n" HIR "疾忙侧身避让，但血刀疾闪，只觉眼"
                                           "前一阵血红，刀刃劈面而下，鲜血飞"
                                           "溅，不禁惨声大嚎！\n" NOR);
        } else
        {
                me->start_busy(2);
                msg += CYN "可是$n" CYN "侧身避让，不慌不忙，躲过了$N"
                       CYN "的必杀一刀。\n"NOR;
                me->add("neili", -100);
        }
        me->receive_wound("qi", 50);
        message_combatd(msg, me, target);
        return 1;
}
