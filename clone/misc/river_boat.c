// river_boat.c

#include <ansi.h>
inherit ITEM;

void create()
{
        set_name("渡船", ({ "boat" }));
        set_weight(200000);
        set_max_encumbrance(1000000);
        if (clonep())
        {
                set_default_object(__FILE__);
                call_out("destruct_me", 10);
        } else
        {
                set("value", 1);
                set("long", @LONG
这是一叶小舟，最多也就能载七、八个人。小舟上有位六
十多岁的老艄公手持长竹篙，正在船尾吃力地撑着船。
LONG);
                set("unit", "艘");
                set("material", "wood");
                set("no_get", "好家伙，船你也想扛在肩上？\n");
        }
        setup();
}

void destruct_me()
{
        destruct(this_object());
}

