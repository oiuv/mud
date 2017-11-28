// jusuo.c 盘龙居居所

#include <room.h>

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "居所");
	set("long", @LONG
这就是盘龙居主人休息，读书的地方。楼上就是主人的卧室，西面则
是书房。
LONG );

	set("default_long", "这就是ROOM_NAME主人ROOM_OWNER休息、读书的" /* EXAMPLE */
                            "地方。楼上就是主人的卧室，西面则是书房。");/* EXAMPLE */
                                                                        /* EXAMPLE */

	set("exits", ([
		"up"   : __DIR__"woshi",
                "west" : __DIR__"shufang",
		"east" : __DIR__"huayuan",  /* EXAMPLE */
	]));

        set("no_sleep_room", 1);
        setup();

//**    set("KEY_DOOR", ([
//**            "exit" : "east",
//**            "room" : __DIR__"huayuan",
//**    ]));
//**
//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_position", "ROOM_POSITION");
}
