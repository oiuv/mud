#include <ansi.h>
inherit ITEM;

void create()
{
        set_name("丐帮密道", ({ "midao" }));
        set_weight(200000);
        set_max_encumbrance(1000000);
        if (clonep())
        {
                set_default_object(__FILE__);
                call_out("destruct_me", 10);
        } else
        {
                set("value", 1);
                set("long", "这是丐帮极其秘密的地下通道，乃用丐帮几辈人心血掘成。\n");
                set("unit", "个");
                set("no_get", "你知道这是啥么？这你也想抗起来？\n");
        }
        setup();
}

void destruct_me()
{
        destruct(this_object());
}
