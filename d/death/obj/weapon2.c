#include <ansi.h>

#include <weapon.h>

inherit CLUB;

void create()
{
        set_name(HIR"方天画戟" NOR, ({ "fangtian huaji","huaji","ji" }));
        set_weight(15000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "杆");
                set("value", 500000);
                set("material", "steel");
                set("long", "一杆玄铁打制的方天画戟，传说是三国名将吕布所用过的武器。\n");
                set("wield_msg", "$N提起$n握在手中，威风凛凛。\n");
        }
        init_club(75);
        setup();
}


