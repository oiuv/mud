#include <ansi.h>
inherit ITEM;

void create()
{
	set_name(HIR "捕兽夹" NOR, ({ "bushou jia","jia", "bushou" }));
	set_weight(1000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "个");
		set("long", "这是专门用来捕捉各种禽兽的，夹齿锋利无比。 \n");
		set("value", 1000);
		set("material", "iron");
	}

	setup();
}

