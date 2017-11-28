#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIG "蛇信子" NOR, ({"shexin zi", "shexing", "zi"}));
        set("unit", "颗");
        set("long", HIG "这是一颗植物的果实。\n" NOR);
        set("value", 10);
        set_weight(10);
        setup();
}
