#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "古树上");
	set("long", @LONG
你极目远眺，四周尽是悬崖峭壁。一条树藤(teng)从高处
垂下。忽然见你看见前面峭壁上似乎有一个山洞(hole)，但是
距离甚远却是怎么也过不去。
LONG);
        set("exits", ([ 
               "down" : __DIR__"xuanyadi",
               "up"   : __DIR__"ontree2"
           ]));

	set("item_desc", ([
               "hole"    : HIC "\n太远了，看得不太清楚，看来得想个办法过去。\n"	NOR,
           
	       "teng"    : YEL"\n这些树藤看起来很结实，似乎是从树顶垂下来的。\n" NOR,
	]));


	setup();
        replace_program(ROOM);
}