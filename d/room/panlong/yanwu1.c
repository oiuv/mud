// yanwu1.c 盘龙居演武厅

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "演武厅");             /* EXAMPLE */
//**    set("short", "ROOM_NAME演武厅");
	set("long", @LONG
这是盘龙居的演武厅，有时有些江湖朋友来会，想一试身手，就
在这里比武较量。
LONG );

	set("default_long", "这是ROOM_NAME的演武厅，有时有些江湖朋友来"/* EXAMPLE */
                            "会，想一试身手，就在这里比武较量。" );    /* EXAMPLE */
                                                                       /* EXAMPLE */

	set("exits", ([
                "west" : __DIR__"yishiting",
	]));

//**    set("objects", ([
//**            "/clone/weapon/zhubang" : 1,
//**            "/clone/weapon/zhujian" : 1,
//**            "/clone/weapon/mudao"   : 1,
//**    ]));

        set("no_sleep_room", 1);
        setup();

//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_position", "ROOM_POSITION");
}
