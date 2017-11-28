// hhuayuan.c 盘龙居花园

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "后花园");
	set("long", @LONG
这是盘龙居的后花园，种着一些采自五湖四海，名山大川的奇花
异草，美丽非常。主人有时读书练武疲倦了，就到这里稍作休息，观
赏花草以怡情自乐，或许能突发灵感，有所领悟。西面就是通往主人
居所的铁门，东面则是一片竹林。
LONG );

	set("default_long", "这是ROOM_NAME的后花园，种着一些ROOM_OWNER"/* EXAMPLE */
                            "采自五湖四海、名山大川的奇花异草，美丽非" /* EXAMPLE */
                            "常。ROOM_OWNER有时读书练武疲倦了，就到这" /* EXAMPLE */
                            "里稍作休息，观赏花草以怡情自乐，或许能突" /* EXAMPLE */
                            "发灵感，有所领悟。西面就是通往主人居所的" /* EXAMPLE */
                            "铁门，东面则是一片竹林。");               /* EXAMPLE */
                                                                       /* EXAMPLE */

	set("exits", ([
                "south"  : __DIR__"houyuan",
                "east"   : __DIR__"zhulin",
		"west"   : __DIR__"jusuo",   /* EXAMPLE */
	]));

        set("outdoors", "OUTDOORS");
        set("sleep_room", 1);
//**    set("room_key", "ROOM_KEY");
        setup();

//**    set("KEY_DOOR", ([
//**            "exit" : "west",
//**            "room" : __DIR__"jusuo",
//**    ]));
//**
//**    set("room_owner", "ROOM_OWNER");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_position", "ROOM_POSITION");
}

void init()
{
//**    ::init();
        add_action("do_sit", "sit");
        this_player()->delete_temp("has_sit");
}

int do_sit(string arg)
{
        object me;

        me = this_player();
        if (me->query_temp("has_sit"))
        {
                message_vision("$N坐在那里摇啊摇，好不惬意。\n", me);
                return 1;
        }

        message_vision("$N找了的地方作了下来，看上去轻松多了。\n", me);
        me->set_temp("has_sit", 1);
        return 1;
}

int valid_leave(object me, string dir)
{
        if (me->query_temp("has_sit"))
        {
                message_vision("$N掸掸尘土，站了起来。\n", me);
                me->delete_temp("has_sit");
        }

        return ::valid_leave(me, dir);
}
