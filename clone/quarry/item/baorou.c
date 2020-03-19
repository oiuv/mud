#include <ansi.h>

inherit COMBINED_ITEM;
#include "meat.h"

void create()
{
        set_name(NOR + WHT "豹肉" NOR, ({ "bao rou", "bao", "rou" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + WHT "这是一块散发着腥臊臭的豹肉。\n" NOR);
                set("base_unit", "块");
                set("base_value", 100);
        }
        setup();
        set_amount(1);
}
