#include <ansi.h>

inherit COMBINED_ITEM;
#include "meat.h"

void create()
{
        set_name(NOR + WHT "羊肉" NOR, ({ "yang rou", "yang", "rou" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + WHT "这是一块散发着腥臊臭的羊肉。\n" NOR);
                set("base_unit", "块");
                set("base_value", 30);
        }
        setup();
        set_amount(1);
}
