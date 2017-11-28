// dao-cloth.c 青色道袍

#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
	set_name(HIC"青色道袍"NOR, ({"pao", "cloth", "dao pao"}) );
	set_weight(3000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "件");
		set("value", 0);
		set("long", "一件普普通通的青布道袍。\n");
		set("material", "cloth");
		set("armor_prop/armor", 2);
	}
	setup();
}
