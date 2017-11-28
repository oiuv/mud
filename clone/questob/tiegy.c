// tiegy.c

inherit ITEM;

void create()
{
	set_name("铁观音", ({ "tie guanyin", "guanyin" }));
	set_weight(1000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "只");
		set("long", "这是一做铁制观音雕像，黑黝黝的，并不美丽。\n");
		set("value", 1000);
		set("material", "iron");
	}
	setup();
}
