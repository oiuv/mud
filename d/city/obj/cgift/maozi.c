// nixie.c

#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
	set_name( HIR "圣诞" HIW "帽" NOR, ({ "mao zi", "mao",  "zi" }) );
	set_weight(1000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "顶");
		set("long", "一顶圣诞帽子，洋溢着节日的气氛。\n");
		set("value", 0);
		set("material", "cloth");
		set("armor_prop/dodge", 5);
	}
	setup();
}
