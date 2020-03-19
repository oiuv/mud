#include <ansi.h>

inherit COMBINED_ITEM;
#include "meat.h"

void create()
{
        set_name(NOR + WHT "虎肉" NOR, ({ "hu rou", "hu", "rou" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + WHT "这是一块散发着腥臊臭的虎肉。\n" NOR);
                set("base_unit", "块");
                set("base_value", 120);
        }
        setup();
        set_amount(1);
}
