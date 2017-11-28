// female7-cloth.c

#include <armor.h>
#include <ansi.h>
inherit CLOTH;

void create()
{
	set_name(HIR"散花衣"NOR, ({ "pink cloth", "cloth" }) );
	set_weight(1000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", "这件红色的散花衣轻轻爽爽，很是飘逸。\n");
		set("unit", "件");
		set("value", 0);
		set("material", "cloth");
		set("armor_prop/armor", 1);
		set("armor_prop/personality", 3);
		set("female_only", 1);
	}
	setup();
}

