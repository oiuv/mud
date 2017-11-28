// tiechui.c 大铁锤

#include <weapon.h>
inherit HAMMER;

void create()
{
        set_name("大铁锤", ({ "tiechui", "chui","hammer" }));
        set_weight(5000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "这是一柄沉重的大铁锤，后面带着长长的铁链。\n");
                set("value", 300);
                set("material", "steel");
                set("wield_msg", "$N「哗啷」的一声,取出一柄$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n挂回腰间。\n");
        }
        init_hammer(30);
        setup();
}
