#include <ansi.h>
#include <combat.h>

#define ZUI "「" HIR "醉里乾坤" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
 
        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/pomopima-jian/zui"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZUI "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器无法施展" ZUI "。\n");

        if (me->query_skill("force") < 150)
                return notify_fail("你的内功的修为不够，无法施展" ZUI "。\n");

        if (me->query_skill("pomopima-jian", 1) < 120)
                return notify_fail("你的泼墨披麻剑修为不够，无法施展" ZUI "。\n");

        if (me->query("neili") < 250)
                return notify_fail("你的真气不够，无法施展" ZUI "。\n");

        if (me->query_skill_mapped("sword") != "pomopima-jian") 
                return notify_fail("你没有激发泼墨披麻剑，无法使用" ZUI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "一声长吟，手中" + weapon->name() + NOR + HIR
              "连划三个圆圈，幻作三个光圈，便如是有形之物，缓缓向$n" HIR
              "身前移去！\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 2);
                me->add("neili", -200);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 70,
                                           HIR "$n" HIR "只觉剑气满室，寒风袭体，"
                                           "微微一楞，已连中三剑，鲜血飞溅！\n" NOR );
        } else
        {
                me->add("neili", -100);
                me->start_busy(3);
                msg += CYN "可是$p" CYN "见来势迅猛，飞身一跃，"
                       "闪开了$P" CYN "这凌厉的几剑。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
