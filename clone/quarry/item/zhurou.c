#include <ansi.h>

inherit COMBINED_ITEM;
#include "meat.h"

void create()
{
        set_name(NOR + WHT "野猪肉" NOR, ({ "yezhu rou", "yezhu", "rou" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + WHT "这是一块散发着腥臊臭的野猪肉。\n" NOR);
                set("base_unit", "块");
                set("base_value", 50);
        }
        setup();
        set_amount(1);
}
