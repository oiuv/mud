// daogu-cloth.c 花格道袍

#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
	set_name(HIM"花格道袍"NOR, ({"pao", "cloth", "dao pao"}) );
	set_weight(3000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "件");
		set("value", 0);
		set("long", "一件普普通通的花格道袍。\n");
		set("material", "cloth");
		set("armor_prop/armor", 2);
		set("female_only", 1);
	}
	setup();
}
