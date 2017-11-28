// yingke.c 盘龙居迎客厅

#include <room.h>

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "迎客厅");             /* EXAMPLE */
//**    set("short", "ROOM_NAME迎客厅");
	set("long", @LONG
这里是盘龙居的主人迎接八方来客的地方。大凡客人来拜见主人，少
不得在这里寒暄叙话，了尽仰慕之情。东面通往一个茶室，是主人陪同客
人品尝天下名茶之处。
LONG );

	set("default_long", "这里是ROOM_NAME的主人ROOM_OWNER迎接八方来" /* EXAMPLE */
                            "客的地方。大凡客人来拜见ROOM_OWNER，少不"  /* EXAMPLE */
                            "得在这里寒暄叙话，了尽仰慕之情。东面通往"  /* EXAMPLE */
                            "一个茶室，是主人陪同客人品尝天下名茶之处"  /* EXAMPLE */
                            "。" );                                     /* EXAMPLE */
                                                                        /* EXAMPLE */

	set("exits", ([
		"north"  : __DIR__"yishiting",
                "south"  : __DIR__"zoudao",
                "east"   : __DIR__"chashi",
	]));

        create_door("east", "木门", "west", DOOR_CLOSED);

//**    set("objects", ([
//**            "/d/room/roomnpc/yahuan" : 2,
//**    ]));

        set("no_sleep_room", 1);
        setup();

//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_position", "ROOM_POSITION");
}
