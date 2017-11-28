#include <ansi.h>
inherit ITEM;

void create()
{
       set_name(HIW "千日醉" NOR, ({"qianri zui", "qianri", "zui"}));
       set("unit", "颗");
       set("long", HIW "这是一颗核桃大小的果实，散发着一股浓郁的酒香。\n" NOR);
       set("value", 200);
       set_weight(50);
       setup();
}
