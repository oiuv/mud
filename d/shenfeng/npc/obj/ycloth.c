#include <armor.h>
inherit CLOTH;

void create()
{
        set_name("羊皮袄", ({ "yangpi ao", "ao"}) );
        set_weight(5000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("long", "这是一件灰色的羊皮袄。牧羊人不管春夏秋冬都穿着它。\n");
                set("material", "cloth");
                set("armor_prop/armor", 3);
                set("value", 500);
        }
        setup();
}
