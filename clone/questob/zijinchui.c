// zijinchui.c

inherit ITEM;

void create()
{
	set_name("紫金锤", ({ "zijin chui", "chui" }));
	set_weight(10000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "对");
		set("long", "这是一对八棱紫金锤，精美的装饰品。\n");
		set("value", 4000);
		set("material", "copper");
	}
	setup();
}
