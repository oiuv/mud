// yulong.c

inherit ITEM;

void create()
{
	set_name("玉龙玦", ({ "yulong jue", "jue" }));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "块");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
		set("long", "这是一块有缺口的玉环，上面纹着一条龙。\n");
		set("value", 1);
		set("material", "jade");
	}
	setup();
}
