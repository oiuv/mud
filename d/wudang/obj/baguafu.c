//baguafu.c 八卦弟子服
#include <armor.h>
inherit CLOTH;

void create()
{
        set_name("八卦服", ({ "baguafu" }));
        set("long", "这是八卦弟子练功服。\n");
        set_weight(2000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("material", "cloth");
                set("unit", "件");
                set("value", 200);
                set("armor_prop/armor", 50);
        }
        setup();
}

