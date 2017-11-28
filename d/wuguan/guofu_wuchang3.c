#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "西练武场");
	set("long", @LONG
这是间大大的房子，十分宽阔，不少人在这里汗流浃背的
苦练着功夫，地上有一些练武用的工具。
LONG);
        set("no_fight", 1);
        set("can_dazuo", 1);
	set("exits", ([
	       "south" : __DIR__"guofu_wuchang1",
	       "north" : __DIR__"guofu_lang3",
        ]));
	setup();
}
