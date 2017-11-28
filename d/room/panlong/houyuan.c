// houyuan.c 盘龙居后院

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "后院");
	set("long", @LONG
这是盘龙居的后院，正中一个假山，傲然而立、非常雄伟。下有
一水池，环山而走，悠然不息。东面乃是练武之处，西面是佣人们准
备食物的厨房。
LONG );

	set("default_long", "这是ROOM_NAME的后院，正中一个假山，傲然而"/* EXAMPLE */
                            "立、非常雄伟。下有一水池，环山而走，悠然" /* EXAMPLE */
                            "不息。东面乃是练武之处，西面是厨房。");   /* EXAMPLE */
                                                                       /* EXAMPLE */

	set("exits", ([
                "south" : __DIR__"zhongting",
                "north" : __DIR__"huayuan",
                "east"  : __DIR__"lianwu",
                "west"  : __DIR__"chufang",
	]));

        set("outdoors", "OUTDOORS");
        set("no_sleep_room", 1);
        setup();

//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_position", "ROOM_POSITION");
}
