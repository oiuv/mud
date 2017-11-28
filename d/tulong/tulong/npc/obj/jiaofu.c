#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
        set_name(WHT"天鹰教服"NOR, ({ "ying cloth","cloth"}) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", "这是一件天鹰教服。\n");
                set("value", 300);
                set("material", "silk");
                set("armor_prop/armor", 2);
        }
        setup();
}

