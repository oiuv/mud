// flower-leaf.c
 
#include <weapon.h>
#include <ansi.h>
 
inherit THROWING;
void create()
{
	set_name(HIR"花瓣"NOR, ({ "flower leaf", "hua ban", "ban" }) );
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", "新鲜的玫瑰花的花瓣，上面还挂这晶莹的露珠。\n");
		set("unit", "把");
		set("value", 0);
		set("base_unit", "片");
		set("base_weight", 1);
		set("base_value", 0);
                set("material", "wood");
		set("damage", 2);	//Here the damage=int_throwing, added by King
		set("wield_msg", HIC"$N迅速地从暗器袋中掏出一些玫瑰花瓣，捏在手中就待发出！\n"NOR);
		set("unwield_msg",HIC"$N将手里剩下的玫瑰花瓣尽数放回暗器袋中。\n"NOR);
	}
	set_amount(50);
	init_throwing(2);
	setup();
}
