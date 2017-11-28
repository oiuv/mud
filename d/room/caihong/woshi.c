// woshi.c 彩虹居卧室

#include <room.h>

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "卧室");             /* EXAMPLE */
//**    set("short", "ROOM_NAME卧室");
	set("long", @LONG
这是主人的卧室，收拾得井井有条。南窗下是一张大床，床边有一个
柜子，还有一个书架。整间屋子虽然朴素，但是可以说是样样俱全，并不
缺少什么东西。
LONG );

	set("default_long", "这是主人的卧室，收拾得井井有条。南窗下是"   /* EXAMPLE */
                            "一张大床，床边有一个柜子，还有一个书架，"   /* EXAMPLE */
                            "上面放着一些书。整间屋子布置得非常朴素，"   /* EXAMPLE */
                            "并不奢华。屋门在西首。");                   /* EXAMPLE */
                                                                         /* EXAMPLE */
	setup();

        set("exits", ([
                "west" : __DIR__"dating",
        ]));

        create_door("west", "木门", "east", DOOR_CLOSED);
//**
//**    set("sleep_room", 1);
//**    set("loving_room", 1);
        set("no_fight", 1);
//**
//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_position", "ROOM_POSITION");
}
