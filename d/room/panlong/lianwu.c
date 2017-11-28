// lianwu.c 盘龙居练武场

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "练武场");
	set("long", @LONG
此处便是盘龙居的练武场，人在江湖，武功万万不可荒废。
LONG );

	set("default_long", "此处便是ROOM_NAME的练武场，人在江湖，武功"/* EXAMPLE */
                            "万万不可荒废。");                         /* EXAMPLE */
                                                                       /* EXAMPLE */

	set("exits", ([
                "west" : __DIR__"houyuan",
	]));

//**    set("objects", ([
//**            "/clone/npc/mu-ren" : 4,
//**    ]));

        set("outdoors", "OUTDOORS");
        set("no_sleep_room", 1);

        setup();
//**
//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_position", "ROOM_POSITION");
}
