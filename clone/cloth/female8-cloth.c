// female8-cloth.c

#include <armor.h>
#include <ansi.h>
inherit CLOTH;

void create()
{
	set_name(MAG"紫纱小夹衫"NOR, ({ "cloth" }) );
	set_weight(1000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", "这是件紫纱小夹衫。\n");
		set("unit", "件");
		set("value", 0);
		set("material", "cloth");
		set("armor_prop/armor", 1);
		set("armor_prop/personality", 3);
		set("female_only", 1);
	}
	setup();
}

