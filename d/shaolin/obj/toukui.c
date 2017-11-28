// huyao.c

#include <ansi.h>
#include <armor.h>

inherit HEAD;

void create()
{
	set_name( HIC "头盔" NOR, ({ "tou kui", "kui" }) );
	set_weight(500);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "顶");
                set("long", "这是一顶金属头盔，用以保护头部。\n");
		set("value", 100);
		set("material", "head");
		set("armor_prop/armor", 10);
		set("shaolin",1);
	}
	setup();
}
