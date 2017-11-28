// bsdao.c

inherit ITEM;

void create()
{
	set_name("宝石刀", ({ "baoshi dao", "dao" }));
	set_weight(700);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "对");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
		set("long", "一对镶满宝石的小刀，昂贵的饰品。\n");
		set("value", 1);
		set("material", "jade");
	}
	setup();
}
