//新增猴拳一个连招pfm
#include <ansi.h>
#include <combat.h>
inherit F_SSERVER;

int perform(object me, object target)
{
	string msg;
	int i, n;
//	object weapon;
	string *msgs = ({ 
			"笑问七剑一指仙！",
			"叶落枫舞二穿山！",
			"袖里风云三点头！",
			"回首太白四气刀！",
			"化月孤心五看地！",
			"茫茫秋水六荒天！",
			"笑问叶落看风云！",
			"回首化月望秋水！",}); 
	n = 2 + random(me->query_skill("mizong-houquan", 1) / 40);
	if (n > 8) n = 8;
	
	if (me->is_busy())
		return notify_fail("你现在没空！！\n");
	
	if ((int)me->query_skill("mizong-houquan", 1) < 200)
		return notify_fail("你的猴拳不够娴熟!\n");
	
	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("「破釜沉舟」只能空手使用。\n");		

	if (!target ) target = offensive_target(me);
	
	if (!target || !target->is_character() || !me->is_fighting(target))
		return notify_fail("［破釜沉舟］只能对战斗中的对手使用。\n");
	
	if ((int)me->query("neili", 1) < 500)
		return notify_fail("你现在内力太弱，不能使用「破釜沉舟」。\n");
	
	if (me->query_skill_prepared("unarmed") ||
		me->query_skill_prepared("strike"))
			n -= 3;
		
	msg = HIY  "$N使出独步天下的［迷踪猴拳］，一招[破釜沉舟]打出了第一式！\n" NOR;
	message_combatd(msg, me, target);
	
	for (i = 1; i < n; i++)
	{
		me->add_temp("apply/attack", i * 50);
        me->add_temp("apply/unarmed_damage", i * 10);
		msg = msgs[random(sizeof(msgs))];
		msg = HIC "\n第" + chinese_number(i) + "招---" + msg + NOR;
		message_vision(msg, me, target);
		COMBAT_D->do_attack(me, target);
		me->add_temp("apply/attack", -i * 50);
        me->add_temp("apply/unarmed_damage", -i * 10);
		me->add("neili", -50);
	}
	me->start_busy(random(i));
	return 1;
}