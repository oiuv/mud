#include <ansi.h>
#include <combat.h>

#define PAN "「" HIR "蝰蟒盘身" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	int damage;
	string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/kuimang-dao/pan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(PAN "只能对战斗中的对手使用。\n");
 
        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对，难以施展" PAN "。\n");

        if ((int)me->query_skill("force") < 60)
                return notify_fail("你的内功火候不够，难以施展" PAN "。\n");

        if ((int)me->query_skill("kuimang-dao", 1) < 40)
                return notify_fail("你的蝰蟒刀法还不到家，难以施展" PAN "。\n");

        if (me->query_skill_mapped("blade") != "kuimang-dao")
                return notify_fail("你没有激发蝰蟒刀法，难以施展" PAN "。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的真气不够，难以施展" PAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIR "$N" HIR "手中" + weapon->name() +  HIR "翻转不定，忽然只见刀"
              "光一闪，刀锋已向$n" HIR "斜斜撩去。\n" NOR;

        ap = me->query_skill("blade");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
	{
		damage = ap / 3 + random(ap / 3);
                me->add("neili", -30);
		msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 20,
                                           HIR "$n" HIR "微微一愣间，已被$N" HIR
                                           "刀锋带中，划出一道鲜血淋漓的伤口！\n" NOR);
		me->start_busy(2);
	} else 
	{
		msg += CYN "可是$p" CYN "微微一笑，身子朝一旁偏过尺许，躲开$P"
                       CYN "这一刀。\n" NOR;
                me->add("neili", -10);
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}
