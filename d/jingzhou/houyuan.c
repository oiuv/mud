
inherit ROOM;

void create()
{
	set("short", "衙门后院");
	set("long", @LONG
这里是衙门的后院，打扫得非常干净，四周是过人的围墙，院子里种
了不少的各种奇花异草，尤以各色菊花为多。院西是丫鬟的房间，东侧有
一扇门(men)。
LONG );

        set("item_desc", ([
                "men" : "这扇门后便是凌小姐的闺房。\n",
        ]));
        
	set("exits", ([ /* sizeof() == 2 */
                "west"  : __DIR__"xixiang",  
                "north" : __DIR__"ymzhengting",
                "east"  : __DIR__"dongxiang",
        ]));
	
        set("objects", ([
		__DIR__"npc/guanjia" : 1,
	]));
	
	set("no_clean_up", 0);
	setup();
	// replace_program(ROOM);
}

void init()
{
	add_action("do_unlock", "unlock");
	if (present("guan jia", environment(this_player())))
		delete("exits/east");
}

int do_unlock(string arg)
{
	object ob;
	if (query("exits/east"))
		return notify_fail("这扇门已经是打开的。\n");
	if (!arg || (arg != "men" && arg != "east"))
		return notify_fail("你要打开什么？\n");
	if (!(ob = present("guifang key", this_player())))
		return notify_fail("你不会撬锁。\n");
	set("exits/east", __DIR__"dongxiang");
	message_vision("$N用一把钥匙打开房门，可是钥匙却断了。\n", this_player());
	destruct(ob);
	return 1;
}

int valid_leave(object me, string dir)
{
	if (!wizardp(me) && objectp(present("guan jia", environment(me))) && 
		(dir == "west" || dir =="east"))
		return notify_fail("管家挡住了你：请勿入内宅。\n");
	return ::valid_leave(me, dir);
}
