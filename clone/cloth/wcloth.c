// cloth: wcloth.c
// Jay 3/17/96

#include <armor.h>
inherit CLOTH;

void create()
{
        set_name("维吾尔族长袍", ({ "weiwuer robe", "robe"}) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", "这是一件色彩斑斓的维吾尔族长袍\n");
                set("material", "cloth");
                set("armor_prop/armor", 2);
                set("value", 50);
        }
        setup();
}

