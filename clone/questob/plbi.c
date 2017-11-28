// plbi.c

inherit ITEM;

void create()
{
	set_name("盘龙壁", ({ "panlong bi", "bi" }));
	set_weight(600);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "块");
                set("no_sell", "这...这是什么东西？我可不敢要。\n");
		set("long", "一块玉璧，上面印着一条龙，却是天然形成，妙不可言。\n");
		set("value", 1);
		set("material", "jade");
	}
	setup();
}
