// Code of ShenZhou
//  shedan.c
//  xuy 09/21/96
//  modified by ryu, 6/2/97

#include <ansi.h>
inherit ITEM;

nosave int used=0;
void delete_benefit(object me);
void decay();
int cure_ob(string);
void init()
{
	if (used) return;
	remove_call_out("decay");
	call_out("decay", 120);
}

void create()
{
        set_name("蟒蛇胆", ({"shedan", "dan" }));
        set("unit", "枚");
        set("long", "一枚深紫色的蟒蛇胆，甚是腥臭。\n");
        set("value", 20000);
                set("no_sell", 1);
	set("medicine", 1);
	set("no_cleanup", 1);
        setup();
}

int cure_ob(object me)
{
	if( !living(this_player()) ) return 0;
	if( used ) return 0;
	if( me->is_busy() )
                return notify_fail("你上一个动作还没有完成。\n");

	if ((int)me->query_condition("bonze_drug") > 0
	|| (int)me->query_condition("mang_shedan") > 0){
	me->add("eff_jingli", -1);
	me->add("max_jingli", -1);
	message_vision(HIR "$N吃下一颗蛇胆，只觉得头重脚轻，摇摇欲倒，
原来服食太急太多，药效适得其反！\n" NOR, me);
	destruct(this_object());
        return 1;
	}	

	me->add("food", 10);
	me->add("water", 10);
	me->add_temp("apply/constitution", 1);
	me->add_temp("apply/strength", 1);
	me->add("eff_jingli", 1);
	me->add("max_jingli", 1);
	me->add("jingli", 100);
	me->apply_condition("bonze_drug", 30+me->query_condition("bonze_drug"));
	me->apply_condition("mang_shedan", 30);
	me->set_temp("dan_effect", 1);
	tell_object(me, MAG"你张口轻轻一咬，蛇胆外皮便即破裂，登觉满口苦汁，腥极苦极，几乎要呕将出来。\n"
			+ "可稍过片刻，你只觉呼吸顺畅，耳清目明，精神爽利，力气大增。\n"NOR);

        message("vision", MAG + me->name() + "吞下一颗蟒蛇胆，精神大旺，尤胜平时。\n"NOR, 
			environment(me), ({me}));
//	me->start_call_out( (: call_other, __FILE__, "delete_benefit", me :), 800);
	used = 1;
//	remove_call_out("decay");
//	move(VOID_OB);
	destruct(this_object());	
	return 1;
}

void decay()
{
	object where = environment(this_object());
	if ( interactive(where) )
		message("vision", MAG"蛇胆啪的一声破了，弄得你一身甚是腥臭。\n"NOR, 
			where); 
	else
		message("vision", MAG"蛇胆啪的一声破了，汁水流了一地。\n"NOR,
			where);
	destruct(this_object());
}

/*void delete_benefit(object me)
{
	me->add_temp("apply/strength", -1);
	me->add_temp("apply/constitution", -1);
	destruct(this_object());
}
*/
