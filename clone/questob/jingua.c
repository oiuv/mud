// jingua.c

inherit ITEM;

void create()
{
	set_name("金瓜", ({ "jin gua", "gua" }));
	set_weight(8000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "瓜");
		set("long", "这是一只黄铜浇铸的镀金瓜状，透露出一股华贵气息。\n");
		set("value", 5000);
		set("material", "copper");
	}
	setup();
}
