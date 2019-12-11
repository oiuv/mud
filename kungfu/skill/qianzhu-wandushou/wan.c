#include <ansi.h>

inherit F_SSERVER;

int perform(object me, object target)
{
        // mapping prepare;
        string msg;
        int skill;
        int delta;
        int i, count, poison;

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (userp(me) && ! me->query("can_perform/qianzhu-wandushou/wan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! me->is_fighting(target))
                return notify_fail("「万蛊噬天」只能对战斗中的对手使用。\n");

		//晕倒后不可以再出pfm by over 20180129
		if (! living(target))
				return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        if (me->query_skill_prepared("hand") != "qianzhu-wandushou")
                return notify_fail("你没有准备使用千蛛万毒手，无法施展万蛊噬天。\n");

        skill = me->query_skill("qianzhu-wandushou", 1);
		poison = me->query_skill("poison");

        if (skill < 220)
                return notify_fail("你的千蛛万毒手修为有限，无法施展万蛊噬天。\n");

        if (me->query_skill("force") < 300)
                return notify_fail("你的内功火候不够，难以施展万蛊噬天。\n");

        if (me->query("max_neili") < 3500)
                return notify_fail("你的内力修为没有达到那个境界，无法运转内力施展万蛊噬天。\n");

        if (me->query("neili") < 500)
                return notify_fail("你的真气不够，现在无法施展万蛊噬天。\n");

        if (me->query_temp("weapon"))
                return notify_fail("你必须是空手才能施展万蛊噬天。\n");

        msg = RED "\n$N" RED "仰天一声长啸，强催内劲，全身"
              "竟浮现出隐隐碧绿之色。喝道：“万蛊噬天”,双"
              "掌猛\n然拍出，登时幻出漫天碧绿色掌影，毒气弥"
              "漫，笼罩$n" RED "全身！\n\n" NOR;

        message_combatd(msg, me, target);
        delta = skill / 6;
		count = 0;
        me->add("neili", -300);
		if (me->query("family/family_name") == "五毒教")
			count = (int)(poison / 50) * 3;
        target->add_temp("apply/parry", -delta);
        target->add_temp("apply/dodge", -delta);
		me->add_temp("apply/unarmed_damage", count);
        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;
                if (random(3) == 1 && ! target->is_busy())
                        target->start_busy(1);
                COMBAT_D->do_attack(me, target, 0, 0);
        }
        target->add_temp("apply/parry", delta);
        target->add_temp("apply/dodge", delta);
		me->add_temp("apply/unarmed_damage", -count);
        me->start_busy(1 + random(5));

        return 1;
}
