#include <ansi.h>
#include <combat.h>

#define FENG "「" HIG "封字诀" NOR "」"

inherit F_CLEAN_UP;
inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string wp;
        int skill;

        if (userp(me) && ! me->query("can_perform/dagou-bang/feng"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if ((int)me->query_temp("feng_zijue"))
                return notify_fail("你现在正在施展" FENG "。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "staff")
                return notify_fail("你使用的武器不对，难以施展" FENG "。\n");

        skill = me->query_skill("dagou-bang", 1);

        if (skill < 120)
		return notify_fail("你打狗棒法不够娴熟，难以施展" FENG "。\n");

        if (me->query_skill_mapped("staff") != "dagou-bang")
                return notify_fail("你没有激发打狗棒法，难以施展" FENG "。\n");

	if ((int)me->query_skill("force") < 180)
		return notify_fail("你的内功火候不足，难以施展" FENG "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" FENG "。\n");

        wp = weapon->name();

        message_combatd(HIG "$N" HIG "使出打狗棒法「" HIY "封"
                        HIG "」字诀，手中" + wp + HIG "疾速舞"
                        "动，幻出许许棒影护住周身。\n" NOR, me);

        me->add("neili", -150);
        me->add_temp("apply/parry", skill / 3);
        me->set_temp("feng_zijue", 1);

        me->start_call_out((: call_other, __FILE__, "remove_effect",
                              me, skill / 3 :), skill / 2);

        if (me->is_fighting())
                me->start_busy(2);

        return 1;
}

void remove_effect(object me, int amount)
{
        if ((int)me->query_temp("feng_zijue"))
        {
                me->add_temp("apply/parry", -amount);
                me->delete_temp("feng_zijue");
                tell_object(me, "你的" FENG "施展完毕，将内力收回丹田。\n");
        }
}
