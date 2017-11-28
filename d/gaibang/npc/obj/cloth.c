#include <ansi.h>
#include <armor.h>
inherit CLOTH;

void create()
{
        set_name(NOR + WHT "破布衣" NOR, ({ "cloth" }));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", WHT "这是一件满是油腻的破布衣。\n" NOR);
                set("unit", "件");
                set("material", "cloth");
                set("armor_prop/armor", 1);
        }
        setup();
}

