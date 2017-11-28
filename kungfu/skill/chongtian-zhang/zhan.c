#include <ansi.h>
#include <combat.h>

#define ZHAN "「" HIW "翅展九州" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	int damage;
	string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/chongtian-zhang/zhan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
                return notify_fail(ZHAN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(ZHAN "只能空手施展。\n");

        if (me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，难以施展" ZHAN "。\n");

        if ((int)me->query_skill("chongtian-zhang", 1) < 120)
                return notify_fail("你的白鹤冲天掌不够娴熟，难以施展" ZHAN "。\n");

        if (me->query_skill_mapped("strike") != "chongtian-zhang")
                return notify_fail("你没有激发白鹤冲天掌，难以施展" ZHAN "。\n");

        if (me->query_skill_prepared("strike") != "chongtian-zhang")
                return notify_fail("你没有准备白鹤冲天掌，难以施展" ZHAN "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你的真气不够，难以施展" ZHAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "$N" HIW "双臂舒张，掌缘微微颤动，身形一展，已移至$n"
              HIW "跟前，双掌交叉奋力劈下，正是\n白鹤冲天掌「翅展九州」"
              "绝技，空气中顿时爆响出一阵尖锐的破空声。\n" NOR;

	me->add("neili", -50);
        ap = me->query_skill("strike");
        dp = target->query_skill("force");
        if (ap / 2 + random(ap) > dp)
	{
		damage = me->query_skill("strike") * 3 / 5;
                damage += random(damage / 3);
		me->add("neili", -100);

                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 30,
                                           HIR "$n" HIR "躲闪不得，只能硬挡下双掌"
                                           "，顿时被$P" HIR "双掌砍中双肩两侧，吐"
                                           "血不止！\n" NOR);
		me->start_busy(3);
	} else
	{
		msg += CYN "可是$p" CYN "奋力招架，终于将$P"
                       CYN "这双掌架开，没有受到任何伤害。\n"NOR;
		me->start_busy(4);
	}
	message_combatd(msg, me, target);

	return 1;
}
