#include <ansi.h>
#include <combat.h>

#define SHE "「" HIR "拔枪狼牙射击" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int i;

        if (userp(me) && ! me->query("can_perform/gun/she"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
                return notify_fail(SHE "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "hammer")
                return notify_fail("你使用的武器不对，难以施展" SHE "。\n");

        if ((int)me->query_skill("gun", 1) < 80)
                return notify_fail("你的枪械技术不够熟练，难以施展" SHE "。\n");

        if (me->query_skill_mapped("hammer") != "gun")
                return notify_fail("你并没有运用枪械技术，难以施展" SHE "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "施出秘奥义「拔枪狼牙射击」，手中" + weapon->name() +
              HIR "连续数枪，同时喷出数十条火龙罩向$n" HIR "四周！\n\n" NOR;
        message_combatd(msg, me, target);

        for (i = 0; i < 18; i++)
        {
                if (! me->is_fighting(target))
                        break;
                COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->start_busy(1);
        return 1;
}
