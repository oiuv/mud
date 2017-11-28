// flower_poison.c

#include <ansi.h>

int dispel(object me, object ob)
{
	if (me == ob)
	{
		tell_object(me, "你试图运功化解断肠花毒，突然一感到"
				"阵撕心裂肺的疼痛，几乎晕厥。\n");
		return -1;
	}

	tell_object(me, "你将真气输入" + ob->name() + "体中，却觉得"
                        "真气运转异常怪异，难以理解，\n突然见" + ob->name() +
			"汗如雨下，连忙住手。\n");
	tell_object(ob, "你觉得" + me->name() + "将内力缓缓输入你的"
			"经脉，忽然一阵撕心裂肺的剧痛，\n犹胜断肠花"
			"毒发作的时候，令你几乎晕厥。\n");
	return -1;
}

int update_condition(object me, int duration)
{
	if(me->query_temp("nopoison")) return 0;

	message("vision", HIG + me->name() + "一阵摇晃，立足"
			  "不定。\n" NOR,
		environment(me), me);

	if(! living(me) &&
	   (me->query("qi") < 25 || me->query("jing") < 25))
	{
      		me->set_temp("die_reason", "断肠花毒发作，不治身亡了");
      		me->die();
      		return 0;
	}

	me->receive_wound("jing", 25 + random(25));
	me->receive_damage("jing", 25 + random(25));
	me->receive_wound("qi", 50 + random(50));
	me->receive_damage("qi", 50 + random(50));
	if (me->query_skill("force") >= 300)
		me->apply_condition("flower_poison", duration - 1);
	tell_object(me, HIG "你中的" HIR "断肠花毒" HIG "发作了！\n" NOR );
	if( duration < 1 )
	{
		tell_object(me, HIR "你心口一阵剧痛，不禁一阵晕眩，过"
			    "后感觉却好了一些。\n" NOR);
		return 0;
	}
	return 1;
}

