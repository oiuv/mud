#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIM "龙涎香" NOR, ({"longxian xiang", "longxian", "xiang"}));
        set("unit", "块");
        set("long", HIM "这是一块黑红色的东西，散发出奇异香气。\n" NOR);
        set("value", 1000);
        set_weight(50);
        setup();
}
