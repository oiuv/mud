// chouyin.c

inherit ITEM;

void create()
{
	set_name("绸印", ({ "chou yin", "yin" }));
	set_weight(600);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "方");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
		set("long", "绸子制成的印章，稀世罕见。\n");
		set("value", 1);
		set("material", "silk");
	}
	setup();
}
