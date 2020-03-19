#include <ansi.h>
#include <combat.h>

#define NI "「" HIW "逆转乾坤" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
		
		float improve;
		int lvl, i, n;
		string martial;
		string *ks;
		martial = "sword";

        if (userp(me) && ! me->query("can_perform/qiankun-jian/ni"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(NI "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" NI "。\n");

        if (me->query_skill("force") < 300)
                return notify_fail("你的内功的修为不够，难以施展" NI "。\n");

        if (me->query_skill("qiankun-jian", 1) < 180)
                return notify_fail("你的乾坤神剑修为不够，难以施展" NI "。\n");

        if (me->query("neili") < 400)
                return notify_fail("你的真气不够，难以施展" NI "。\n");

        if (me->query_skill_mapped("sword") != "qiankun-jian")
                return notify_fail("你没有激发乾坤神剑，难以施展" NI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "一声清啸，手中" + weapon->name() +
              HIW "一振，将乾坤剑法逆行施展，顿时剑影重重，万"
              "道光华直追$n" + HIW "而去！\n" NOR;
			  
		lvl = to_int(pow(to_float(me->query("combat_exp") * 10), 1.0 / 3));
		lvl = lvl * 4 / 5;
		ks = keys(me->query_skills(martial));
		improve = 0;
		n = 0;
		//最多给予5个技能的加成
		for (i = 0; i < sizeof(ks); i++)
		{
			if (SKILL_D(ks[i])->valid_enable(martial))
			{
				n += 1;
				improve += (int)me->query_skill(ks[i], 1);
				if (n > 4 )
					break;
			}
		}
		
		improve = improve * 3 / 100 / lvl;

        ap = me->query_skill("sword") + me->query_skill("force");
        dp = target->query_skill("dodge") + target->query_skill("parry");
		
		ap += ap * improve;

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 3 + random(ap / 3);
                me->add("neili", -200);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 120,
                                           HIR "$n" HIR "完全无法看清招中虚实，微"
                                           "微一楞间，发现" + weapon->name() + HIR
                                           "竟已没入自己胸口数寸。\n" NOR);
        } else
        {
                me->add("neili", -80);
                me->start_busy(4);
                msg += CYN "可是$n" CYN "看破" CYN "$N" CYN
                       "的招数，飞身一跃，闪开了这神鬼莫测"
                       "的一击。\n"NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
