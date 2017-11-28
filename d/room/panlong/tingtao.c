// tingtao.c 盘龙居听涛阁

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "听涛阁");
	set("long", @LONG
这是竹林一角的听涛阁，在这里风吹竹叶的阵阵涛声听的非常真
切，真是让人心旷神怡。实在是一个参悟武功的好去处。
LONG );

	set("default_long", "这是竹林一角的听涛阁，在这里风吹竹叶的阵" /* EXAMPLE */
                            "阵涛声听的非常真切，真是让人心旷神怡。实" /* EXAMPLE */
                            "在是一个参悟武功的好去处。");             /* EXAMPLE */
                                                                       /* EXAMPLE */

	set("exits", ([
                "west" : __DIR__"zhulin",
	]));

        set("sleep_room", 1);
        setup();

//**    set("research_improve", 15);  //15% improved
//**
//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_position", "ROOM_POSITION");
}
