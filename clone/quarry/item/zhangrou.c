#include <ansi.h>

inherit COMBINED_ITEM;
#include "meat.h"

void create()
{
        set_name(NOR + WHT "獐子肉" NOR, ({ "zhang rou", "zhang", "rou" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + WHT "这是一块散发着腥臊臭的獐子肉。\n" NOR);
                set("base_unit", "块");
                set("base_value", 40);
        }
        setup();
        set_amount(1);
}
