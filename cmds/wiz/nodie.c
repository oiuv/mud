#include <ansi.h>

inherit F_CLEAN_UP;
 
int main(object me, string arg)
{
	object ob;
	mapping my;
 
        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

	seteuid(getuid(me));
 
	if(! arg)
		ob = me;
	else
        {
		ob = present(arg, environment(me));
		if (!ob) ob = find_player(arg);
		if (!ob) ob = find_living(arg);
        }

        if (! ob || ! userp(ob))
                return notify_fail("你要为谁设置死亡保护？\n");
 
        if (ob->query_temp("guard_death") >= 1)
                return notify_fail("目标已经设置死亡保护，如要恢复，请"
                                   "使用 full 指令。\n");

        if (ob != me)
        {
	        if (wiz_level(me) < wiz_level("(wizard)"))
		        return notify_fail("你没有权限为" + ob->name() +
                                           "设置死亡保护。\n");

                message_system(sprintf("%s(%s)为%s(%s)设置了死亡保护。\n",
                                       me->name(1), me->query("id"),
                                       ob->name(1), ob->query("id")));
        }

	my = ob->query_entire_dbase();
        my["jing"]   = my["eff_jing"]   = my["max_jing"];
        my["jingli"] = my["eff_jingli"] = my["max_jingli"];
        my["qi"]     = my["eff_qi"]     = my["max_qi"];
        my["neili"]  = my["max_neili"];
        my["food"]   = ob->max_food_capacity();
        my["water"]  = ob->max_water_capacity();

        if (me == ob)
	{
                message_vision(HIY "$N" HIY "面露拈花之色，口中念念"
                               "有词，说不尽的慈祥安和。\n" NOR, me);
		me->clear_condition();
                me->set_temp("guard_death", 1);
        } else
        {
                message_vision(HIY "$N" HIY "面露拈花之色，说不尽的"
                               "慈祥安和。伸手轻轻抚过$n" HIY "的头"
                               "顶。\n" NOR, me, ob);
                if (! living(ob)) ob->revive();
		ob->clear_condition();
                ob->set_temp("guard_death", 1);
		log_file("static/nodie", sprintf("%s %s 为 %s(%s) 设置了死亡保护。\n",
					 log_time(), log_id(me),
				         ob->name(1), ob->query("id")));
        }
	return 1;
}
 
int help()
{
	write(@HELP
指令格式 : nodie <对象名称>
 
这个指令可以给对象设置死亡保护。
 
HELP);
        return 1;
}
