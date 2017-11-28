#include <ansi.h>
#include <weapon.h>
inherit ITEM;

void create()
{
        set_name(HIG "七子刚镖" NOR, ({"qizi gangbiao"}));
        set_weight(50);
        if (clonep())
                set_default_object(__FILE__);
        else
        {
                set("long", "这是一枚四川唐门秘制的刚镖，威力无比。\n");
                set("value", 21);
                set("unit", "枚");
        }
        setup();
}
