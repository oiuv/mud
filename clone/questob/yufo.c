// yufo.c

inherit ITEM;

void create()
{
	set_name("玉佛", ({ "yu fo", "fo" }));
	set_weight(1000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "个");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
		set("long", "这是一尊笑眯眯的弥勒佛。\n");
		set("value", 1);
		set("material", "jade");
	}
	setup();
}
