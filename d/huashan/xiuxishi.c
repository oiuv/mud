// Room: xiuxishi.c

inherit ROOM;

void init();
void close_men();
int do_open(string);
int do_close(string);

void create()
{
        set("short", "华山小筑");
        set("long", @LONG
这是间整洁的厢房，因门窗常闭着，光线很昏暗。房里别无他物，
只有中间放着一张收拾得舒舒服服的大床，看着就让人想睡觉。
LONG );

        set("sleep_room", 1);
        set("no_fight", 1);

        setup();
}

void init()
{
        object me = this_player();
	add_action("do_open", "open");
	add_action("do_close", "close");

        if (me->query_temp("xunshan")) me->set_temp("xunshan/yunu", 1);
}

void close_men()
{
	object room;

	if(!( room = find_object(__DIR__"xiaolu2")) )
		room = load_object(__DIR__"xiaolu2");

	if(objectp(room) && query("exits/west"))
	{
		delete("exits/west");
		message("vision", "门咿咿呀呀地自己合上了。\n", this_object());
		room->delete("exits/east");
		message("vision", "门咿咿呀呀地自己合上了。\n", room);
	}
}

int do_close(string arg)
{
	object room;

	if (!arg || (arg != "men" && arg != "door"))
		return notify_fail("你要关什么？\n");

	if (!query("exits/west"))
		return notify_fail("门已经是关着的了。\n");

	message_vision("$N一伸手，把门关上了。\n", this_player());

	if(!( room = find_object(__DIR__"xiaolu2")) )
		room = load_object(__DIR__"xiaolu2");

	if(objectp(room))
	{
                message("vision", "门被人从里面关上了。\n", room);
		delete("exits/west");
		room->delete("exits/east");
	}

	return 1;
}

int do_open(string arg)
{
	object room;
	object me = this_player();

	if (!arg || (arg != "men" && arg != "door" && arg != "west"))
		return notify_fail("你要开什么？\n");

	if (query("exits/west"))
		return notify_fail("大门已经是开着了。\n");

	if(!( room = find_object(__DIR__"xiaolu2")) )
		room = load_object(__DIR__"xiaolu2");
	if(objectp(room))
	{
		set("exits/west", __DIR__"xiaolu2");
		message_vision("$N轻手轻脚地把门打开。\n", this_player());
		room->set("exits/east", __FILE__);
		
		if (me->query_temp("sleeped"))
		{
		message("vision", "吱地一声，"+me->query("name") +
                                  "精神焕发地从里面把门打开了。\n",
		room);
		} else 
		{
		message("vision", "梆地一声，"+me->query("name") +
                                  "从里面把门打开，一脸的不耐烦。\n",
			 room);
		}	
		
		remove_call_out("close_men");
		call_out("close_men", 10);
	}

	return 1;
}


int valid_leave(object me, string dir)
{
//	object room;

	if ( !::valid_leave(me, dir) ) 
		return 0;
	
	add_temp("person_inside", -1);	
	if ((int)query_temp("person_inside") <= 0)
		delete_temp("person_inside");	
	
	return 1;
}