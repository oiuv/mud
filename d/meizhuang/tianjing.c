// tianjing.c
inherit ROOM;

void create()
{
        set("short", "大天井");
        set("long", @LONG
你走过一个大天井，天井左右各植一棵老梅，枝干如铁，极是苍
劲。往南是梅庄大门，北面是大厅。
LONG
        );
        set("exits", ([ /* sizeof() == 2 */
            "north" : __DIR__"dating",
        ]));
        set("objects", ([ /* sizeof() == 2 */
            __DIR__"npc/huyuan" : 1,
        ]));
        set("outdoors", "meizhuang");
//        set("no_clean_up", 0);

        setup();
//        replace_program(ROOM);
}
void init()
{
        add_action("do_open", "open");
}
int do_open(string arg)
{
	object room;

	if (query("exits/south"))
		return notify_fail("大门已经是开着了。\n");

	if (!arg || (arg != "gate" && arg != "south"))
		return notify_fail("你要开什么？\n");

	if(!( room = find_object(__DIR__"gate")) )
		room = load_object(__DIR__"gate");
	if(objectp(room))
	{
		set("exits/south", __DIR__"gate");
		message_vision("$N使劲把大门打了开来。\n", this_player());
		room->set("exits/north", __FILE__);
		message("vision", "吱地一声，里面有人把大门打开了。\n", room);
		remove_call_out("close_gate");
		call_out("close_gate", 10);
	}

	return 1;
}

void close_gate()
{
	object room;

	if(!( room = find_object(__DIR__"gate")) )
		room = load_object(__DIR__"gate");
	if(objectp(room))
	{
		delete("exits/south");
			message("vision", "护院上前把大门关了起来。\n", this_object());
		room->delete("exits/north");
		message("vision", "乒地一声，里面有人把大门关上了。\n", room);
	}
}

