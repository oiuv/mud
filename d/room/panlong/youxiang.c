// youxiang.c 盘龙居右厢房

#include <room.h>

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "右厢房");
	set("long", @LONG
这是盘龙居的右厢房，是客人居住的地方。
LONG );

	set("default_long", "这是ROOM_NAME的右厢房，是客人居住的地方。虽" /* EXAMPLE */
                            "然不算奢华，却也布置得非常舒适。一张床整" /* EXAMPLE */
                            "齐干净，没有多少折纹，而窗帘厚大结实，使" /* EXAMPLE */
                            "屋内光线恰到好处。" );                    /* EXAMPLE */
                                                                       /* EXAMPLE */

	set("exits", ([
                "east" : __DIR__"zhongting",
	]));

        set("sleep_room", 1);
        set("no_fight", 1);

        create_door("east", "木门", "west", DOOR_CLOSED);

        setup();

//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_position", "ROOM_POSITION");
}
