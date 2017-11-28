//Room: xubufang.c

inherit ROOM;

void create ()
{
	set ("short", "巡捕房");
	set ("long", @LONG
这里是长安城里维持治安的巡捕工作的地方。房门口放着两个青铜
狮，房内是一个大厅，墙上漆着白色的漆，漆得很厚，仿佛不愿人看出
这墙是石壁，是土，还是铜铁所做。有几个横眉立目，嘴脸凶顽的巡捕
坐在一起，似乎在商量着什么。南边有一个小门，似乎上了锁。
LONG);
	set("exits", ([
        	"west" : __DIR__"fengxu5",
        ]));
        set("objects", ([
        	__DIR__"npc/butou"  : 1,
        	__DIR__"npc/guanbing" : 2,
        ]));

        setup();
}

void init()
{
	add_action("do_open", "open");
}

int do_open(string arg)
{
	object me, key, nroom;
	me = this_player();
	if (! arg || arg != "door")
		return notify_fail("你要打开什么？\n");

	if (! (key = present("laofang key", me)))
		return notify_fail("你没有开这道门的钥匙。\n");

	if (! (nroom = find_object(__DIR__"laofang")))
	      	nroom = load_object(__DIR__"laofang");

	set("exits/south", __DIR__"laofang");
	nroom->set("exits/north", __FILE__);
	message("vision", "只听喀嚓！一声，钥匙断了。好"
                "在牢门已经开了。\n", this_object() );
	me->set_temp("used_laofang_key", 1);
	destruct(key);
	return 1;
}
