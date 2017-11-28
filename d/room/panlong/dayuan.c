// xiaoyuan.c 盘龙居大院

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "大院");             /* EXAMPLE */
//**    set("short", "ROOM_NAME大院");
	set("long", @LONG
这是一个宽阔的院落，种着各种树木，阳光照下来透过树荫投下层层
影子。有一条大路通向里面。
LONG );

	set("default_long", "这是一个宽阔的院落，种着各种树木，阳光照"   /* EXAMPLE */
                            "下来透过树荫投下层层影子。一条大路通向里"   /* EXAMPLE */
                            "面，踩得非常平滑的，看来是经常有人来往。"); /* EXAMPLE */
                                                                         /* EXAMPLE */

	set("exits", ([
		"north"  : __DIR__"qianting",
                "out"    : "/d/room/xiaoyuan",
	]));

        set("outdoors", "OUTDOORS");
        set("no_sleep_room", 1);
        set("valid_startroom", 1);
        setup();

//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_OWNER_id", "ROOM_OWNER_ID");
//**    set("room_id", "ROOM_ID");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_position", "ROOM_POSITION");
}
