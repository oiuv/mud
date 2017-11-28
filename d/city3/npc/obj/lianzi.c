// tielianzi.c
#include <weapon.h>
#include <ansi.h>

inherit THROWING;

void create()
{
        set_name(HIC"铁莲子"NOR, ({ "tie lianzi", "lianzi","tie" }) );
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "些");
                set("value", 0);
                set("base_unit", "颗");
                set("base_weight", 300);
                set("base_value", 0);
                set("material", "iron");
                set("long", HIW"铁莲子是一种以量取胜的暗器，沉颠颠的。\n"NOR);
                set("wield_msg", HIC"$N迅速地从暗器袋中掏出一些铁莲子，捏在手中就待发出！\n"NOR);
                set("unwield_msg",HIC"$N将手里剩下的铁莲子尽数放回暗器袋中。\n"NOR);
             }
        set_amount(50);
        init_throwing(25);
        setup();
}
