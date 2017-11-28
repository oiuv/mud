// suoming.c 修罗索命

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
        int ap, dp;
        int damage;
 
	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
	        return notify_fail("「修罗索命」只能在战斗中对对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "blade")
		return notify_fail("你使用的武器不对。\n");

	if (me->query_skill("force") < 200)
		return notify_fail("你的内功的修为不够，不能使用这一绝技！\n");

	if (me->query_skill("xiuluo-dao", 1) < 135)
		return notify_fail("你的修罗刀法修为不够，目前不能使用修罗索命！\n");

	if (me->query("neili") < 250)
		return notify_fail("你的真气不够，不能使用修罗索命！\n");

        if (me->query_skill_mapped("blade") != "xiuluo-dao")
                return notify_fail("你没有激发修罗刀法，不能使用修罗索命！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "$N" HIC "脸上杀气大盛，一振手中的" + weapon->name() +
              HIC "，唰唰数刀将$n" + HIC "团团裹住！\n" NOR;

        ap = me->query_skill("blade");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 2);
                me->add("neili", -180);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 60,
                                           HIR "就听见$p" HIR "惨叫连连，一阵阵血雨自" HIR
                                           "亮白的刀光中溅出！\n" NOR);
                me->start_busy(2);
        } else
        {
                me->add("neili", -60);
                me->start_busy(3);
                msg += CYN "可是$p" CYN "眼明手快，只听叮叮当当响起了一串"
                       CYN "刀鸣，$p" CYN "将$P" CYN "的招式全部挡开！\n" NOR;
        }
	message_combatd(msg, me, target);

	return 1;
}
