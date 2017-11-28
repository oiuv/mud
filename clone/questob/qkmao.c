// qkmao.c

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name("乾坤帽", ({ "qiankun mao", "mao" }));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "顶");
		set("long", "这是一顶小小的黑帽子，上面绣了几颗宝石。\n");
		set("value", 10000);
		set("material", "cloth");
	}
	setup();
}
