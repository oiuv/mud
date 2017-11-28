#include <ansi.h>
#include <combat.h>

#define ZHUI "「" HIR "追魂夺命" NOR "」"

inherit F_SSERVER;

string final(object me, object target, int damage);

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/zhuihun-jian/zhui"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHUI "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" ZHUI "。\n");

        if (me->query_skill_mapped("sword") != "zhuihun-jian") 
                return notify_fail("你没有激发追魂夺命剑，难以施展" ZHUI "。\n");

        if ((int)me->query_skill("zhuihun-jian", 1) < 100)
                return notify_fail("你的追魂夺命剑还不够娴熟，难以施展" ZHUI "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你现在真气不够，难以施展" ZHUI "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "一声冷哼，手中" + weapon->name() +
              HIR "一式「追魂夺命」，剑身顿时漾起一道血光，直射$n"
              HIR "！\n" NOR;

        me->add("neili", -150);
        ap = me->query_skill("sword");
        dp = target->query_skill("dodge");
        if (target->is_bad()) ap += ap / 5;

        me->start_busy(3);
        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 60,
                                           (: final, me, target, damage :));
        } else
        {
                msg += CYN "可$n" CYN "却是镇定逾恒，一丝不乱，"
                       "全神将此招化解开来。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}

string final(object me, object target, int damage)
{
        return  HIR "只听$n" HIR "一声惨叫，被这一剑穿胸而入，顿"
                "时鲜血四处飞溅。\n" NOR;
}

