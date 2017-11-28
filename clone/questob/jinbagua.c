// jinbagua.c

inherit ITEM;

void create()
{
	set_name("金八卦", ({ "jin bagua", "bagua" }));
	set_weight(1200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "面");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
		set("long", "一面纯金衬底嵌玉的八卦，非常华贵。\n");
		set("value", 1);
		set("material", "gold");
	}
	setup();
}
