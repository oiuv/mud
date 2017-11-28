// yuping.c

inherit ITEM;

void create()
{
	set_name("玉瓶", ({ "yu ping", "ping" }));
	set_weight(700);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "只");
		set("long", "这是一只玉瓶，玲珑精致。\n");
		set("value", 1500);
		set("material", "jade");
	}
	setup();
}
