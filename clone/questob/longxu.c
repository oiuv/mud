// longxu.c

inherit ITEM;

void create()
{
	set_name("龙须", ({ "long xu", "xu" }));
	set_weight(600);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "根");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
		set("long", "一根青绿色的须毛，长而粗壮，据说是龙须。\n");
		set("value", 1);
		set("material", "silk");
	}
	setup();
}
