// liang-xie.c

#include <ansi.h>
#include <armor.h>

inherit BOOTS;

void create()
{
	set_name( HIC "Á¹Ð¬" NOR, ({ "liang xie", "xie" }) );
	set_weight(1000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "Ë«");
		set("long", "Ò»Ë«Ï¸´øºÚÆ¤Æ½µ×Ð¡Á¹Ð¬¡£\n");
		set("value", 1);
		set("material", "boots");
		set("armor_prop/dodge", 5);
	}
	setup();
}

int query_autoload() { return 1; }

