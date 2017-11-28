#include <weapon.h>

inherit HAMMER;

void create()
{
	set_name( "法轮",({ "fa lun" ,"lun" ,"falun" }));
	set_weight(1000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "把");
		set("long","这是一柄法轮，僧人们用他来作法事。\n");
		set("value", 50);
		set("material", "wood");
		set("wield_msg", "$N抽出一柄$n握在手中。\n");
		set("unwield_msg","$N将手中的$n放回腰间。\n");
	}
        init_hammer(5);
	setup();
}
