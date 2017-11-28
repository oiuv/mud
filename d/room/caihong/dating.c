// dating.c 彩虹居大厅

#include <room.h>

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "大厅");             /* EXAMPLE */
//**    set("short", "ROOM_NAME大厅");
	set("long", @LONG
这就是彩虹居主人迎送客人的地方，正中有一些桌椅，侧面是屏风，
厅堂中挂着两个条幅。不过上面居然什么都没有写。东面是主人的房间。
LONG );

	set("default_long", "这就是ROOM_NAME主人ROOM_OWNER迎送客"  /* EXAMPLE */
                            "人的地方。正中有些桌椅，侧面是两扇"   /* EXAMPLE */
                            "屏风。东首是主人ROOM_OWNER的房间，"   /* EXAMPLE */
                            "有一扇木门虚掩着。南边是大门，出去"   /* EXAMPLE */
                            "就是院子。");                         /* EXAMPLE */
                                                                   /* EXAMPLE */
	setup();

	set("exits", ([
                "east"   : __DIR__"woshi",
		"north"  : __DIR__"houyuan",
                "south"  : __DIR__"xiaoyuan",   /* EXAMPLE */
	]));

        create_door("east", "木门", "west", DOOR_CLOSED);

        set("no_sleep_room", 1);

//**    set("KEY_DOOR", ([
//**            "exit" : "south",
//**            "room" : __DIR__"xiaoyuan",
//**    ]));
//**
//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_position", "ROOM_POSITION");
}
