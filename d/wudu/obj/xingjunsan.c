#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(NOR + YEL "诸葛行军散" NOR, ({ "xingjun san", "xingjun", "san" }));
        set("unit", "包");
        set("long", NOR + YEL "这是一包预防瘴气的药散，带在身上可以预防瘴气。\n" NOR);
        set("no_sell", "这是啥破玩意儿？也想卖钱？");
        set("value", 1);
        set_weight(200);        
        setup();
}