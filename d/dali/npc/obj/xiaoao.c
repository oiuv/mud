// xiaoao.c

#include <armor.h>
inherit CLOTH;

void create()
{
	set_name("圆领小袄", ({ "xiao ao", "cloth" }));
	set("long", "这是一件台夷族的圆领小袄。\n");
	set_weight(2000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("material", "cloth");
		set("unit", "件");
		set("value", 300);
		set("armor_prop/armor", 1);
	}
	setup();
}
