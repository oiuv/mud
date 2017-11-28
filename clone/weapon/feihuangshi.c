// feihuangshi.c
 
#include <weapon.h>
 
inherit THROWING;
 
void create()
{
	set_name("飞蝗石", ({ "feihuangshi", "shi" }) );
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", "仔细挑选的鹅卵石，大小一致，个个都滴溜溜圆。\n");
		set("unit", "把");
		set("value", 0);
		set("base_unit", "个");
		set("base_weight", 1);
		set("base_value", 0);
		set("damage", 5);	//Here the damage=int_throwing, added by King
	}
	set_amount(20);
	init_throwing(15);
	setup();
}
