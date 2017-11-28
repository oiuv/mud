#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(YEL "禹王神像" NOR, ({ "xiang" }) );
        set_weight(500000);
        set_max_encumbrance(800);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "座");
                set("long", "大禹治水，历四十年，后人为纪念而设。\n");
                set("value", 50);
        }
}
