// feihuangshi.c
 
#include <weapon.h>
#include <ansi.h>
 
inherit THROWING;
 
void create()
{
	set_name("飞蝗石", ({ "feihuang shi", "shi" }) );
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
                set("material", "stone");
		set("wield_msg", HIC"$N迅速地从暗器袋中掏出一些飞蝗石，捏在手中就待发出！\n"NOR);
		set("unwield_msg",HIC"$N将手里剩下的飞蝗石尽数放回暗器袋中。\n"NOR);
	}
	set_amount(20);
	init_throwing(25);
	setup();
}
