#include <weapon.h>
inherit BLADE;

void create()
{
        set_name("哈萨克弯刀", ({ "hasake wandao", "hasake", "wandao", "dao", "blade" }));
        set_weight(4000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "这是一柄亮晃晃的哈萨克短刀, 是哈萨克人的防身武器。\n");
                set("value", 500);
                set("material", "steel");
                set("wield_msg", "$N「唰」的一声从腰间拔出一柄$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n插回腰间。\n");
        }
        init_blade(15);
        setup();
}
