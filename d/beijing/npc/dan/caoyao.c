// caoyao.c

#include <ansi.h>

inherit ITEM;

void create() 
{
        set_name(HIG "不知名草药" NOR, ({"cao yao", "yao", "cao"}));
        set_weight(10);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "株");
                set("long", "这是一株生长在密林中的不知名的草药，一般人都会误认成杂草。\n");
        }
        setup();
}
