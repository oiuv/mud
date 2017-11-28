// jingui.c

inherit ITEM;

void create()
{
	set_name("金龟", ({ "jin gui", "gui" }));
	set_weight(12000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "只");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
		set("long", "一只硕大无比的纯金制成的龟像，贵重无比。\n");
		set("value", 1);
		set("material", "gold");
	}
	setup();
}
