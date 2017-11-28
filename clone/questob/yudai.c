// yudai.c

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name("玉带", ({ "yu dai" }));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "条");
		set("long", "这是一条玉带，上面绣得五彩缤纷，颇为美丽。\n");
		set("value", 10000);
		set("material", "silk");
	}
	setup();
}
