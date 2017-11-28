// tiedan.c
#include <weapon.h>
#include <ansi.h>

inherit THROWING;

void create()
{
        set_name(HIW"铁胆"NOR, ({ "tiedan", "dan" }) );
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "些");
                set("value", 0);
                set("base_unit", "枚");
                set("base_weight", 300);
                set("base_value", 0);
                set("material", "iron");
                set("long", HIG"一些溜圆的铁胆，是一种凶猛的暗器。\n"NOR);
                set("wield_msg", HIC"$N迅速地从身上摸出一些铁胆，捏在手中就待发出！\n"NOR);
                set("unwield_msg",HIC"$N将手里剩下的铁胆一抖就不见了。\n"NOR);
        }
        set_amount(50);
        init_throwing(30);
        setup();
}
