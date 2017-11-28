//wuxingfu.c 五行弟子服
#include <armor.h>
inherit CLOTH;

void create()
{
        set_name("五行服", ({ "wuxingfu" }));
        set("long", "这是五行弟子练功服。\n");
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
