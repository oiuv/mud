// tongxq.c

inherit ITEM;

void create()
{
	set_name("铜喜鹊", ({ "tong xique", "xique" }));
	set_weight(800);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "只");
		set("long", "这是一黄铜喜鹊饰物，象征着吉祥如意。\n");
		set("value", 5000);
		set("material", "copper");
	}
	setup();
}
