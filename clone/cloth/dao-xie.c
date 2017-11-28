// dao-xie.c

#include <ansi.h>
#include <armor.h>

inherit BOOTS;

void create()
{
	set_name( HIY "ÂéÐ¬" NOR, ({ "ma xie", "xie" }) );
	set_weight(1000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "Ë«");
		set("long", "Ò»Ë«Çà²¼ÂéÐ¬¡£\n");
		set("value", 0);
		set("material", "boots");
		set("armor_prop/dodge", 5);
	}
	setup();
}
