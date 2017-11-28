// female-shoe.c

#include <armor.h>
#include <ansi.h>

inherit BOOTS;

void create()
{
	set_name(HIM"绣花小鞋"NOR, ({ "flower shoes", "shoes"}) );
	set_weight(900);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("material", "cloth");
		set("unit", "双");
		set("long", "一双女人穿的缝制得很精美的绣花鞋。\n");
		set("value", 0);
		set("armor_prop/armor", 1 );
		set("female_only", 1);
	}
	setup();
}
