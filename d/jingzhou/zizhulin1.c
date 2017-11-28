#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "紫竹林");
	set("long", @LONG
你眼前突然一遍光明，你来到了一座有许多紫竹搭成的花
园(yuan)面前，里面飘出阵阵花香，四周紫竹环抱，说不出的
诗情画意。隐约看到里面种有些花卉。
LONG);
        set("outdoors", "jingzhou");

	set("exits", ([
		"north" : __DIR__"zizhulin",
		"enter" : __DIR__"xiaoyuan",
	]));
        set("item_desc", ([
                "yuan": HIM "\n这里看来是一处种花的好地方，可隐约看到里面"
                        "种有许许多多\n的花卉，由许多的紫竹搭建而成。\n" NOR
        ]) );
	setup();
	replace_program(ROOM);
}

