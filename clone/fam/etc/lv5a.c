inherit ITEM;
#include <ansi.h>

void create()
{
        set_name(HIC "天残玉" NOR, ({"tiancan yu", "tiancan", "yu"}));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
         	set("long", HIC "这是一块晶莹剔透的勾玉，珍贵无比。\n" NOR);
                set("unit", "块");
                set("value", 15000);
        }
        setup();
}

int query_autoload()
{
        return 1;
}

