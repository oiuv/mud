// fuling.c 茯苓
// By Lgg,1998.10

#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(YEL"茯苓"NOR, ({"fu ling"}));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "块");
                set("long", "这是一块成型的茯苓，看来可以入药。\n");
                set("only_do_effect", 1);
        }

        setup();
}

int do_effect(object me)
{
        write("你三口两口把茯苓吃了下去。\n");
        destruct(this_object());
        return 1;
}
