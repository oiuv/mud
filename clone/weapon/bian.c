// bian.c 鞭

#include <weapon.h>
inherit WHIP;

void create()
{
        set_name("羊鞭", ({ "bian", "yangbian","whip" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "这是一柄普通的羊鞭，做工粗糙。\n");
                set("value", 30);
                set("material", "leather");
                set("wield_msg", "$N「唰」的一声从腰后抽出一柄$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n别回腰后。\n");
        }
        init_whip(5);
        setup();
}

