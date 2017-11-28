#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(RED "朱羽" NOR, ({ "zhu yu", "yu", "yumao"}));
	set_weight(100);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", RED "一束神兽朱雀的羽毛，不知道有什么用。\n" NOR);
		set("unit", "束");
		set("value", 1000);
	}
}

