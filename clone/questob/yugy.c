// yugy.c

inherit ITEM;

void create()
{
	set_name("玉观音", ({ "yu guanyin", "guanyin" }));
	set_weight(900);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "个");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
		set("long", "这是一尊晶莹剔透的玉观音。\n");
		set("value", 1);
		set("material", "jade");
	}
	setup();
}
