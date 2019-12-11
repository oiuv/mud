#include <ansi.h>
#include <combat.h>

#define CHUO "「" HIG "戳字诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
        int ap, dp, damage, level;

        if (userp(me) && ! me->query("can_perform/dagou-bang/chuo"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(CHUO "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "staff")
                return notify_fail("你使用的武器不对，难以施展" CHUO "。\n");

        level = me->query_skill("dagou-bang", 1);

        if (level < 100)
		return notify_fail("你打狗棒法不够娴熟，难以施展" CHUO "。\n");

        if (me->query_skill_mapped("staff") != "dagou-bang")
                return notify_fail("你没有激发打狗棒法，难以施展" CHUO "。\n");

	if ((int)me->query_skill("force") < 160)
		return notify_fail("你的内功火候不足，难以施展" CHUO "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" CHUO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIG "$N" HIG "使出打狗棒法「" HIR "戳" HIG "」字诀，单"
              "手一振，霎时棒影窜动，疾刺$n" HIG "胸前要穴。\n" NOR;

        ap = me->query_skill("staff") +
             me->query_skill("martial-cognize",1);

        dp = target->query_skill("dodge") +
             target->query_skill("martial-cognize",1);

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           HIR "$n" HIR "全然无法勘破$N" HIR "的"
                                           "精妙招式，胸口一麻，射出一柱鲜血！\n" NOR);
                me->start_busy(2);
                me->add("neili", -100);
        } else
        {
                msg += CYN "可$n" CYN "全神防御，不露半点破绽，使得$N"
                       CYN "这招无功而返。\n" NOR;
                me->start_busy(3);
                me->add("neili", -50);
        }
        message_combatd(msg, me, target);

	return 1;
}
