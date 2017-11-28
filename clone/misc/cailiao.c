// cailiao.c

#include <ansi.h>

inherit COMBINED_ITEM;

void create()
{
        set_name("菜料", ({ "cai liao", "liao" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "做菜的原料，青菜萝卜、鸡鸭鱼肉。\n");
                set("base_unit", "份");
                set("base_value", 50);
		set("base_weight", 80);
        }
        setup();

	set_amount(1);
}
