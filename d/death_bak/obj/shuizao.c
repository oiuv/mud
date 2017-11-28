#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(GRN "水藻" NOR, ({ "shui zao", "shui", "zao"}));
        set_weight(700);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIG "一丛生长在碧水寒潭里的耐寒水藻。\n" NOR);
                set("unit", "丛");
                set("value", 0);
                set("no_get", "你试着拔了一下，结果它根深蒂固，你居然没拔动。\n");
        }
}
