#include <weapon.h>
#include <ansi.h>
 
inherit THROWING;

void create()
{
        set_name(HIM "桃花瓣" NOR, ({ "flower leaf", "hua ban", "ban" }) );
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIM "新鲜的桃花花瓣，上面还挂这晶莹的露珠。\n" NOR);
                set("unit", "把");
                set("value", 0);
                set("base_unit", "片");
                set("base_weight", 1);
                set("base_value", 0);
                set("material", "wood");
                set("damage", 2);
        }
        set_amount(50);
        init_throwing(2);
        setup();
}
