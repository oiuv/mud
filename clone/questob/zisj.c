// zisj.c

inherit ITEM;

void create()
{
	set_name("紫水晶", ({ "zi shuijing", "zi" }));
	set_weight(600);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "块");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
		set("long", "看上去和水晶相类，实际上却不是，故此珍贵无比。\n");
		set("value", 1);
		set("material", "stone");
	}
	setup();
}
