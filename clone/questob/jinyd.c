// jinyd.c

inherit ITEM;

void create()
{
	set_name("金腰带", ({ "jin yaodai", "yaodai" }));
	set_weight(5000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "个");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
		set("long", "纯金腰带，重得令人无法穿戴，上面纹着一条龙。\n");
		set("value", 1);
		set("material", "gold");
	}
	setup();
}
