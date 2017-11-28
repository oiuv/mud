// maozy.c

inherit ITEM;

void create()
{
	set_name("猫之眼", ({ "mao yan" }));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "块");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
		set("long", "极大的一块猫眼宝石，周围嵌着金边。\n");
		set("value", 1);
		set("material", "stone");
	}
	setup();
}
