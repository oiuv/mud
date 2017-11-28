#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(RED "精元丹" NOR, ({ "jingyuan dan", "jingyuan", " dan"}));
        set_weight(700);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", RED "一颗神秘的神丹，散发出隐隐血光。\n" NOR);
                set("unit", "块");
                set("value", 20000);
        }
}
