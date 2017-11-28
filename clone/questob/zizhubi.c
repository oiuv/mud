// zizhubi.c

inherit ITEM;

void create()
{
	set_name("紫竹笔", ({ "zizhu bi", "bi" }));
	set_weight(600);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "支");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
		set("long", "一支用紫竹做的笔，世上罕见。\n");
		set("value", 1);
		set("material", "bamboo");
	}
	setup();
}
