//shoupa.c

#include <armor.h>

inherit ITEM;

void create()
{
        set_name( "手帕", ({ "shou pa"}));
        set_weight(300);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "个");
                set("long", "这是一个漂亮的手帕。\n");
                set("value", 50);
                set("material", "cloth");
                set("female_only", 1);
                set("armor_prop/armor", 3);
       }
}
