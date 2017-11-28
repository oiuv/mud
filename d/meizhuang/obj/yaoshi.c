// yaoshi.c
#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIR"红玉钥匙"NOR, ({"tong yaoshi", "yaoshi"}));
        set("long",
                "这是一把看起来很古怪的钥匙。\n");
        set("unit", "把");
        set_weight(10);
}

