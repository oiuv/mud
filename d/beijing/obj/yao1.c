// yao1.c

#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(RED "膏药" NOR, ({ "gaoyao" }));
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "看上去很奇怪的一副膏药，半边红半边黑。\n");
                set("unit", "副");
                set("value", 500);
                set("can_be_applied", 1);
        }
        setup();
}

int do_apply(object me)
{
        write("你撕开药封来，只见一张纸上有个明目，曰：“去清复明膏药”。\n");
        destruct(this_object());
        return 1;
}

