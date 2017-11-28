// yishiting.c 盘龙居议事厅

#include <room.h>

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "议事厅");
	set("long", @LONG
这就是盘龙居主人和重要人物商量大事之处，正中有不少桌椅，侧
面是屏风，厅堂中挂着两个条幅，两旁通往演武厅。
LONG );

	set("default_long", "这就是ROOM_NAME主人ROOM_OWNER和重要人物"  /* EXAMPLE */
                            "商量江湖大事之处，正中有不少桌椅，侧面是" /* EXAMPLE */
                            "屏风，厅堂中挂着两个条幅，两旁通往演武厅" /* EXAMPLE */
                            "。");                                     /* EXAMPLE */
                                                                       /* EXAMPLE */

	set("exits", ([
                "east"   : __DIR__"yanwu1",
                "west"   : __DIR__"yanwu2",
		"north"  : __DIR__"zhongting",
                "south"  : __DIR__"yingke",
	]));

        set("no_sleep_room", 1);
        setup();

//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_position", "ROOM_POSITION");
}
