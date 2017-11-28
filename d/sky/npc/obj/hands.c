#include <weapon.h>
#include <ansi.h>
#include <armor.h> 
inherit HANDS; 

void create()
{
        set_name(RED "残血手套" NOR, ({ "canxue shoutao" , "shoutao" , "canxue", "hand", "tao" }) );
        set_weight(20000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "双");
                set("long", RED "传说中的上古神器。\n" NOR);
                set("value", 100000);
                set("rigidity", 8000);
                set("material", "steel");
                set("armor_prop/armor", 100); 
        }
        setup();
}

