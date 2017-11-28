// chashi.c 盘龙居茶室

#include <room.h>

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "茶室");
	set("long", @LONG
这是一个玲珑小巧的茶室，很是显得精致。正中有一茶几。
LONG );

	set("default_long", "是一个玲珑小巧的茶室，很是显得精致。正" /* EXAMPLE */
                            "中有一茶几，两旁立着两个妙龄少女，正在" /* EXAMPLE */
                            "听候主人的吩咐(tea)。" );               /* EXAMPLE */
                                                                     /* EXAMPLE */

	set("exits", ([
		"west"  : __DIR__"yingke",
	]));

//**    set("objects", ([
//**            "/d/room/roomnpc/teagirl" : 2,
//**    ]));

        create_door("west", "木门", "east", DOOR_CLOSED);

        set("no_sleep_room", 1);
        setup();

//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_position", "ROOM_POSITION");
}
