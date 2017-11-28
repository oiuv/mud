#include <ansi.h>
#include <combat.h>

#define DIAN "「" HIY "电光四射" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
 
        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/jidian-jian/dian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(DIAN "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器无法施展" DIAN "。\n");

        if (me->query_skill("force") < 150)
                return notify_fail("你的内功的修为不够，无法施展" DIAN "。\n");

        if (me->query_skill("jidian-jian", 1) < 100)
                return notify_fail("你的疾电剑法修为不够，无法施展" DIAN "。\n");

        if (me->query("neili") < 250)
                return notify_fail("你的真气不够，无法施展" DIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "冷哼一声，手中" + weapon->name() + NOR + HIY
              "一抖，运剑如飞，霎时之间，四处都是电光，耀人眼目。\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 2);
                me->add("neili", -180);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 40,
                                           HIR "只听“唰唰唰”几声，$n" HIR "无法"
                                           "看透招中虚实，连续被削中数剑，一声惨"
                                           "叫，血如泉涌！\n" NOR );
        } else
        {
                me->add("neili", -60);
                me->start_busy(3);
                msg += CYN "可是$p" CYN "奋力格挡，$P" CYN "只"
                       "觉得对手防守严密，手中剑光渐缓。 \n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
