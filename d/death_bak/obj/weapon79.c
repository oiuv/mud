#include <ansi.h>
#include <weapon.h>

inherit SWORD;

void create()
{
        set_name(HIC "Îâ¹³½£" NOR, ({ "wugou jian", "wugou", "jian", "sword" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "±ú");
                set("value", 400000);
                set("material", "steel");
        }
        init_sword(60);
        setup();
}
