// lingpai.c
#include <ansi.h>

inherit ITEM;

void setup()
{}
void create()
{
        set_name("梅花令牌", ({"ling pai", "ling"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "块");
                set("value", 0);
        }
        setup();
}

