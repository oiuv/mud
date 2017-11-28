// nfeecard.c 无上免费卡
//
// 使用免费卡建房不需要花费任何银两

#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIY "免费卡" NOR, ({ "card", "fee free card" }));
        set_weight(10);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "张");
                set("long", "这是一张无上住房免费卡，凭这张卡可以免费"
                            "购买任何住房。\n");
                set("material", "paper");
                set("fee free", 2000000000);
                set("value", 1);
                set("no_sell", 1);
        }
}

int query_autoload() { return 1; }
