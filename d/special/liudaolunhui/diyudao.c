#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", HIR "\n\n                地        狱        道" NOR);
        set("long", HIR "\n"
"极寒极冷，受尽各种折磨，毫无喜乐之所。若与人间比较，第\n"
"一狱以人间三千七百五十年为一年，在此须受困一万年，相当\n"
"于人间一百三十五亿年。而到了第十八地狱，便以亿亿亿年为\n"
"单位，如此长期的受刑可谓是名符其实的万劫不复。\n\n" NOR);
        setup();
}

