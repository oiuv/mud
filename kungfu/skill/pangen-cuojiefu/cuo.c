#include <ansi.h>
#include <combat.h>

#define CUO "「" HIR "错字诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	int level;
	string msg;

        if (userp(me) && ! me->query("can_perform/pangen-cuojiefu/cuo"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(CUO "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "hammer")
                return notify_fail("你使用的武器不对，难以施展" CUO "。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((level = me->query_skill("pangen-cuojiefu", 1)) < 100)
                return notify_fail("你盘根错节斧不够娴熟，难以施展" CUO "。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功火候不够，难以施展" CUO "。\n");

        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力修为不够，难以施展" CUO "。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你现在真气不够，难以施展" CUO "。\n");

        if (me->query_skill_mapped("hammer") != "pangen-cuojiefu")
                return notify_fail("你没有激发盘根错节斧，难以施展" CUO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIR "$N" HIR "高举手中" + weapon->name() + HIR "，陡然一声断喝，朝着$n"
              HIR "猛挥数斧，气势如虹。\n" NOR;

        me->add("neili", -30);
        if (random(level) > (int)target->query_skill("parry", 1) / 2)
        {
		msg += HIR "$p" HIR "见$P" HIR "来势汹涌，不得不中途"
                       "变招，这一下登时便失了先机！\n" NOR;
                target->start_busy(level / 18 + 1);
	} else
        {
		msg += CYN "可是$p" CYN "看破$P" CYN "招式的来路，斜"
                       "斜跳开，使这招未起到丝毫作用。\n" NOR;
		me->start_busy(2);
	}
	message_combatd(msg, me, target);

	return 1;
}
