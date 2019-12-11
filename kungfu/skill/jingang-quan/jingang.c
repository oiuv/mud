// jingsng.c 金刚拳 大金刚神通

#include <ansi.h>

inherit F_SSERVER;

void remove_effect(object me, int aamount, int damount);

int perform(object me, object target)
{
	// object weapon;
	string msg;
	int d_count, count, qi, maxqi, skill;

	 if (userp(me) && ! me->query("can_perform/jingang-quan/jingang"))
                return notify_fail("你所使用的外功中没有这种功能。\n");


	if ((int)me->query_temp("jingang"))
		return notify_fail("你已经在运功中了。\n");

  if (! target)
  {
    me->clean_up_enemy();
    target = me->select_opponent();
  }

	if (! target || ! me->is_fighting(target))
		return notify_fail("「大金刚神通」只能对战斗中的对手使用。\n");

  if ((me->query_skill_mapped("force") != "hunyuan-yiqi")
		&& (me->query_skill_mapped("force") != "yijinjing")
		&& (me->query_skill_mapped("force") != "luohan-fumogong"))
          return notify_fail("你现在没有激发少林内功为内功，难以施展「大金刚神通」。\n");

	if ((int)me->query("neili") < 500)
		return notify_fail("你的真气不够，无法施展「大金刚神通」！\n");

	if ((int)me->query_skill("force") < 150)
		return notify_fail("你的内功修为不够，不能使用「大金刚神通」！\n");

	if ((int)me->query_skill("cuff") < 150)
		return notify_fail("你的拳法还不到家，无法使用「大金刚神通」！\n");

	if (me->query_skill_mapped("cuff") != "jingang-quan")
		return notify_fail("你没有激发金刚拳，无法使用「大金刚神通」！\n");

       if (! living(target))
             return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "使出大金刚拳的绝技「大金刚神通」，臂力陡然增加！\n" NOR;

	qi = me->query("qi");
	maxqi = me->query("max_qi");
	skill = (int) (me->query_skill("jingang-quan", 1) / 3);
	count = skill / 2;
	d_count = (int)me->query_dex() / 10;

	if (qi > (maxqi * 0.4))
	{
		message_combatd(msg, me, target);

		me->add_temp("str", count * 2);
		me->add_temp("dex", -d_count);
		me->set_temp("jingang", 1);
		me->start_call_out((: call_other, __FILE__, "remove_effect", me, count * 2, d_count :), skill);

		me->add("neili", -150);
	} else
        {
		msg = HIR "$N" HIR "拼尽毕生功力使出了大金刚拳的终"
                      "极绝技, 全身骨骼一阵爆响, 欲与$n" HIR "同归于尽！\n" NOR;
		message_combatd(msg, me, target);
		me->add_temp("str", count * 10);
		me->set_temp("jingang", 1);

		me->start_call_out((: call_other, __FILE__, "remove_effect", me, count * 10, 0 :), 2);

		COMBAT_D->do_attack(me, target, me->query_temp("weapon"), 0);
		me->set("neili",0);
		me->add("max_neili", -10);

		msg = HIR "$N" HIR "用尽了最后一点气力, 喷出一口鲜血, 一头栽倒在地！\n" NOR;
		message_combatd(msg, me, target);
		me->unconcious();
	}
	return 1;
}

void remove_effect(object me, int aamount, int damount)
{
	if ((int)me->query_temp("jingang"))
	{
		me->add_temp("str", -aamount);
		me->add_temp("dex", damount);
		me->delete_temp("jingang");
		tell_object(me, "你的「大金刚神通」运行完毕，将内力收回丹田。\n");
	}
}
