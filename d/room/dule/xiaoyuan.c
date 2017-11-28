// xiaoyuan.c 独乐居小院

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "小院");             /* EXAMPLE */
//**    set("short", "ROOM_NAME小院");
	set("long", @LONG
这里是一个不大的院子，角落里栽了几棵树，地上零零散散有一些碎
落叶片。院门虚掩，穿过院子就是一个小屋，非常精致。
LONG );

//**    set("room_key", "ROOM_KEY");
	setup();

	set("exits", ([
		"north"  : __DIR__"dulewu",     /* EXAMPLE */
                "out"    : "/d/room/xiaoyuan",
	]));

        set("outdoors", "OUTDOORS");
        set("no_sleep_room", 1);
        set("valid_startroom", 1);

//**    set("KEY_DOOR", ([
//**            "exit" : "north",
//**            "room" : __DIR__"dulewu",
//**    ]));
//**
//**    set("room_owner", "ROOM_OWNER");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_position", "ROOM_POSITION");
}
