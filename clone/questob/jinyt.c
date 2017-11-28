// jinyt.c

inherit ITEM;

void create()
{
	set_name("金砚台", ({ "jin yantai", "yantai" }));
	set_weight(1500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "座");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
		set("long", "一座纯金的砚台，入手非常的沉重。\n");
		set("value", 1);
		set("material", "gold");
	}
	setup();
}
