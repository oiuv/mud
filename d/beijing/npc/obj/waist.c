#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("护心镜", ({ "huxin jing", "mirror","huxinjing",  "jing", "huxin", "waist" }) );
        set_weight(1000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "面");
                set("long", "一面黄铜做的护心镜。\n");
                set("material", "copper");
                set("value", 0);
                set("armor_prop/armor", 5);
        }
        setup();
}