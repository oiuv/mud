// goldring.c 金戒指

#include <armor.h>

inherit HANDS;

void create()
{
        set_name("金戒指", ({ "golden ring", "ring" }));
        set_weight(400);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "个");
                set("value", 2000);
                set("material", "gold");
                set("armor_prop/armor", 1);
        }
        setup();
}
