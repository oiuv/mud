// cao.c

#include <ansi.h>

inherit ITEM;

void create()
{
        set_name("腐心草", ({"fuxin cao", "cao"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("long", "这是一朵无根小草，长得很小，却给人一种欣欣向荣的感觉。\n");
                set("only_do_effect", 1);
        }

        setup();
}

int do_effect(object me)
{
        message_vision(HIG "$N" HIG "吃下一株腐心草，顿"
                       "然间有点肚子疼...赶紧去厕所！\n" NOR, this_player());
        destruct(this_object());
        return 1;
}
