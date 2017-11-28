// tielianzi.c
#include <weapon.h>
#include <ansi.h>

inherit THROWING;

void create()
{
        set_name(HIG"碧磷针"NOR, ({ "bilin zhen", "zhen" }) );
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "些");
                set("value", 0);
                set("base_unit", "枚");
                set("base_weight", 300);
                set("base_value", 0);
                set("material", "iron");
                set("long", HIG "碧磷针是星宿派使用的，暗器，常常"
			    "淬毒。针长寸许，发出诡异的光。\n" NOR);
                set("wield_msg", HIC "$N迅速地从身上摸出一些碧磷针，捏"
		                 "在手中就待发出！\n" NOR);
                set("unwield_msg", HIC "$N将手里剩下的碧磷针一抖就不见了"
                                   "。\n"NOR);
        }
        set_amount(50);
        init_throwing(50);
        setup();
}
