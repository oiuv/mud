#include <weapon.h>
#include <ansi.h>
inherit BLADE;

void create()
{
        set_name(CYN "断了的屠龙刀" NOR, ({ "duan dao" , "blade" , "dao"}) );
        set_weight(30000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "一柄断了的刀。\n");
                set("value", 0);
                set("rigidity",8000);     
                set("material", "steel");
        }
        init_blade(1);
        setup();
}


