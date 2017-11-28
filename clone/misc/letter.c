#include <ansi.h>
inherit ITEM;

int is_letter() { return 1; }

void create()
{
        set_name(NOR + WHT "信件" NOR, ({ "letter" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "封");
                set("long", "这是一封信件。\n");
                set("value", 0);
        }
        setup();
}
