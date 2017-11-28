// baijinhe.c

inherit ITEM;

void create()
{
	set_name("白金鹤", ({ "baijin he", "he" }));
	set_weight(1800);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "只");
		set("long", "这是一亮晶晶的金属鹤形饰物，看起来比银子要亮一些。\n");
		set("value", 2000);
		set("material", "platina");
	}
	setup();
}
