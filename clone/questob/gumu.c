// gumu.c

inherit ITEM;

void create()
{
	set_name("古木", ({ "gu mu", "mu" }));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "根");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
		set("long", "一块黑黝黝的木头，不知道有什么用处。\n");
		set("value", 1);
		set("material", "ivory");
	}
	setup();
}
