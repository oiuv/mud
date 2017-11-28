#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "走廊");
        set("long", @LONG
这是一条走廊，两边都是石头柱子。西边是大厅，东边是厨房，
南面是一片广阔的练武场，北面则是休息室。
LONG );

        set("exits", ([
	        "east" : __DIR__"chufang",
	        "west" : __DIR__"dating",
	        "south" : __DIR__"wuchang",
	        "north" : __DIR__"xiuxishi",
        ]));
        set("objects", ([
	        CLASS_D("shenlong")+"/zhang" : 1,
        ]));
        set("outdoors", "shenlong");
        setup();
}

int valid_leave(object me, string dir)
{
        object guarder;

	if (dir == "west" )
                return 1;

        if (objectp(guarder = present("zhang danyue", this_object())))
                return guarder->permit_pass(me, dir);

        return 1;
}
