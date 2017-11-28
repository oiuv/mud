#include "herb.h"

void create()
{
        set_name(HIW "人参" NOR, ({ "ren shen", "ren", "shen", "herb_renshen" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "人参是颇为名贵的中药药材。\n" NOR);
                set("base_unit", "根");
                set("base_value", 10000);
                set("base_weight", 90);
        }
        setup();
}
