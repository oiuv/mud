// qun.c

#include <armor.h>
inherit CLOTH;

void create()
{
	set_name("白纱挑线镶边裙", ({ "xiangbian qun" }));
	set("long", "这是一件当地土著常用的白纱挑线镶边裙。\n");
	set_weight(2000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("material", "cloth");
		set("unit", "件");
		set("value", 250);
		set("armor_prop/armor", 1);
	}
	setup();
}
