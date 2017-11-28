// zysha.c

inherit ITEM;

void create()
{
	set_name("紫云纱", ({ "ziyun sha", "sha", "silk" }));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "匹");
		set("long", "这是一匹淡紫色的华丽丝绸，薄得几乎透明。\n");
		set("value", 5000);
		set("material", "silk");
	}
	setup();
}
