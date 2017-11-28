#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(RED "红木剑架" NOR, ({ "shelf"}) );
        set_weight(50000);
        set_max_encumbrance(800000);
        set("no_get", 1);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("prep", "in");
                set("unit", "只");
                set("long", RED "一只由名贵红木所制，用来存放配剑的架子。\n" NOR);
                set("value", 1);
        }
}

int is_container() { return 1; }

