#include <ansi.h>
#include <weapon.h>

inherit CLUB;

void create()
{
        set_name(HIW "圣骑士戟" NOR, ({ "chivalry lance", "chivalry", "lance" }));
        set_weight(30000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("long", HIW "这是一根银制的长戟，沉重无比，在中原很难见到。\n" NOR);
                set("value", 10000);
                set("material", "silver");
        }
        init_club(90);
        setup();
}

