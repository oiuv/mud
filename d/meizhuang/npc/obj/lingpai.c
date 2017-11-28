// lingpai.c
#include <ansi.h>

inherit ITEM;

void setup()
{}
void create()
{
        set_name("√∑ª®¡Ó≈∆", ({"ling pai", "ling"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "øÈ");
                set("value", 0);
        }
        setup();
}

