// huwan.c 护腕

#include <ansi.h>
#include <armor.h>

inherit WRISTS;

void create()
{
	set_name( "护腕", ({ "wrists", "hu wan", "huwan" }) );
	set_weight(500);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "双");
		set("long", "这是一件布质的护腕，用以保护腕部。\n");
		set("value", 1300);
		set("material", "cloth");
		set("armor_prop/armor", 5);
	}
	setup();
}
