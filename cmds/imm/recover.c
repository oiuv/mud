// recover cmds
// updated by doing
 
#include <ansi.h>
 
inherit F_CLEAN_UP;
 
int main(object me, string arg)
{
	object ob;
	mapping my;
 
        if (! SECURITY_D->valid_grant(me, "(immortal)"))
                return 0;

	seteuid(getuid(me));
 
	if (! arg)
		ob = me;
	else
        {
		ob = present(arg, environment(me));
		if (! ob) ob = find_player(arg);
		if (! ob) ob = find_living(arg);
        }

        if (! ob) return notify_fail("你要恢复谁的状态？\n");
 
        if (ob != me)
        {
	        if (wiz_level(me) < wiz_level("(wizard)"))
		        return notify_fail("你没有权限恢复" + ob->name() + "。\n");

                if (! me->is_admin())
                        message_system(sprintf("%s(%s)为%s(%s)恢复了状态。\n",
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
                message_vision(HIY "$N口中念念有词，不一会儿就变得"
			       "精神焕发，神采奕奕。\n" NOR, me);
		if (me->is_ghost()) me->reincarnate();
		me->clear_condition();
        } else
        {
                message_vision(HIY "$N伸手一指，$n立刻精神焕"
			       "发，神采奕奕。\n" NOR,
                               me, ob);
                if (! living(ob)) ob->revive();
		if (ob->is_ghost()) ob->reincarnate();
		ob->clear_condition();
		log_file("static/recover", sprintf("%s %s recover %s(%s)\n",
					   log_time(), log_id(me),
				           ob->name(1), ob->query("id")));
        }
	return 1;
}
 
int help()
{
	write(@HELP
指令格式 : recover <对象名称>
 
这个指令可以恢复你(你)或指定对象(含怪物)的精, 气, 内力等数值。
 
HELP );
        return 1;
}
