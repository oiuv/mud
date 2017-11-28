#include <ansi.h> 
#include <armor.h>
inherit CLOTH;

void create()
{
        set_name(NOR + YEL "羽氅" NOR, ({ "yu chang", "yu", "chang" }));
        set_weight(3000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "领");
                set("long", NOR + YEL "这是一领用秃鹰长羽织就的大氅。\n" NOR);
                set("material", "cloth");
                set("armor_prop/armor", 15);
        }
        setup();
}

