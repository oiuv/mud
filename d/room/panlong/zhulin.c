// zhulin.c 盘龙居竹林

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "竹林");
	set("long", @LONG
这里种着好大一片竹林，非常幽静。风一起就听竹叶沙沙的响。
LONG );

	set("default_long", "这里种着好大一片竹林，非常幽静。风一起就" /* EXAMPLE */
                            "听竹叶沙沙的响，有时ROOM_OWNER就去听涛阁" /* EXAMPLE */
                            "默听竹浪涛声，参悟武功。");               /* EXAMPLE */
                                                                       /* EXAMPLE */

	set("exits", ([
                "west" : __DIR__"huayuan",
                "east" : __DIR__"tingtao",
	]));

        set("outdoors", "OUTDOORS");
        set("sleep_room", 1);
        setup();

//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_position", "ROOM_POSITION");
}
