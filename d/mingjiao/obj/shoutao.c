// shoutao.c

#include <ansi.h>
#include <armor.h>

inherit HANDS;

void create()
{
	set_name( "皮手套", ({ "pi shoutao", "shoutao" }) );
	set_weight(500);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "双");
                set("long", "这是一双皮手套，上面有硬物刻勒的痕迹。\n");
		set("value", 6000);
		set("material", "hands");
		set("armor_prop/armor", 3);
//		set("shaolin",1);
	}
	setup();
}
