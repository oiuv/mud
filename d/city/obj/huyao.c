// huyao.c

#include <ansi.h>
#include <armor.h>

inherit WAIST;

void create()
{
	set_name( "护腰", ({ "waist", "hu yao", "huyao" }) );
	set_weight(500);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "条");
		set("long", "这是一条皮质的护腰，用以保护腰部。\n");
		set("value", 1600);
		set("material", "leather");
		set("armor_prop/armor", 5);
	}
	setup();
}
