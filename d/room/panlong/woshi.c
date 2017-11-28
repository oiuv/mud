// woshi.c 盘龙居卧室

#include <room.h>

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "卧室");
	set("long", @LONG
这是主人的卧室，收拾得井井有条。南窗下是一张大床，床边有一个
柜子。推开窗户可以看到下面的花园，还可嗅到阵阵花香，非常惬意。远
处是一大片竹林。
LONG );

	set("default_long", "这是主人的卧室，收拾得井井有条。南窗下是" /* EXAMPLE */
                            "一张大床，床边有一个柜子。推开窗户可以看" /* EXAMPLE */
                            "到下面的花园，还可嗅到阵阵花香，非常惬意" /* EXAMPLE */
                            "。远处是一大片竹林。");                   /* EXAMPLE */
                                                                       /* EXAMPLE */

        set("exits", ([
                "down" : __DIR__"jusuo",
        ]));

//**    set("sleep_room", 1);
//**    set("loving_room", 1);
        set("no_fight", 1);
        setup();
//**
//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_position", "ROOM_POSITION");
}
