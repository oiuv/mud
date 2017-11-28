#include <ansi.h>
#include <armor.h>

inherit WAIST;

void create()
{
        set_name("竹篓", ({"zhu lou", "zhu", "lou"}));
        set_weight(300);
        set_max_encumbrance(15000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "个");
                set("long", "这是一个小口大肚的竹篓，常用来存放草药。\n");
                set("wear_msg", "$N将竹篓背在背上。\n");
                set("remove_msg", "$N将竹篓从背上放了下来。\n");
                set("value", 50);
                set("material", "bamboo");
                set("armor_prop/armor", 3);
        }
        setup();
}

int is_container() { return 1; }
