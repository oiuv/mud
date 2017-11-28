#include <ansi.h>
inherit ITEM;

void create()
{
	set_name(HIY "笼子" NOR, ({ "long zi","long", "zi" }));
	set_weight(1000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "个");
		set("long", "这个笼子不太大，看来只能装(zhuang)下较小的动物。 \n");
		set("value", 100);
		set("material", "iron");
	}

	setup();
}

