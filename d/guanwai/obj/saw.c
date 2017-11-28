// saw.c

#include <ansi.h>

inherit ITEM;

int is_saw() { return 1; }

void create()
{
	set_name("钢锯", ({ "gang ju", "ju", "saw" }));
	set_weight(2000);
	if (clonep())
		set_default_object(__FILE__);
	else
        {
                set("value", 800);
		set("unit", "条");
                set("material", "steel");
		set("long", "这是一条黑黝黝的钢锯，一般用来伐木。\n");
	}
	setup();
}
