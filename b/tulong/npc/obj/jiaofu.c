#include <armor.h>
#include <ansi.h>

inherit CLOTH;

void create()
{
        set_name(NOR + WHT "天鹰教服" NOR, ({ "ying cloth", "ying", "cloth"}));
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", NOR + WHT "这是一件天鹰教服。\n" NOR);
                set("value", 300);
                set("material", "silk");
                set("armor_prop/armor", 2);
        }
        setup();
}

