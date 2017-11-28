inherit ITEM;
#include <ansi.h>

void create()
{
        set_name(HIC "青鱼牙" NOR, ({"qingyu ya", "qingyu", "ya"}));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
         	set("long", HIC "内蕴一条小鱼的玛瑙，可谓价值连城。\n" NOR);
                set("unit", "只");
                set("value", 15000);
        }
        setup();
}

int query_autoload()
{
        return 1;
}

