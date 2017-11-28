// houyuan.c 彩虹居后院

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "后院");             /* EXAMPLE */
//**    set("short", "ROOM_NAME后院");
	set("long", @LONG
这是彩虹居的后院，种着一些花草，大部分是都不知名的野生花草。
不过花儿开起来也看上去也非常漂亮。主人如果读书练武疲倦了，就可
以到这里稍作休息，院角放着一张藤椅。
LONG );

	set("default_long", "这是ROOM_NAME的后院，种着一些花草，大"  /* EXAMPLE */
                            "部分是都不知名的野生花草。不过花儿开起" /* EXAMPLE */
                            "来也看上去也非常漂亮。有时ROOM_OWNER读" /* EXAMPLE */
                            "书练武疲倦了，就到这里稍作片刻以休息，" /* EXAMPLE */
                            "也有时友人来到这里，大家在这里切磋一下" /* EXAMPLE */
                            "武艺。");                               /* EXAMPLE */
                                                                     /* EXAMPLE */
	setup();

	set("exits", ([
                "south"  : __DIR__"dating",
	]));

        set("outdoors", "OUTDOORS");
        set("sleep_room", 1);

//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_position", "ROOM_POSITION");
}

void init()
{
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
