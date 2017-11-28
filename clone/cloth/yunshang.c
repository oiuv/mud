// yunshang.c

#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
	set_name(HIG "云裳" NOR, ({ "yunshang" }));
	set("long", "这是一件织女裁剪西天之云织成的云裳。\n");
	set_weight(10);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("material", "cloth");
		set("unit", "件");
		set("value", 1);
                set("armor_prop/armor", 1);
	}
	setup();
}
