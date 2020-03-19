inherit ROOM;

void create()
{
        set("short", "石崖客栈");
	set("long", @LONG
这里是雪山山路上的一间客栈，虽然店面简单朴实，平日也
不可能有什么游客来这雪域游山玩水，但在这大雪山上，却也是
独一无二的客栈。到了这地方，要是不想被活活冻死在这万里冰
川上，只怕还是得照顾一下这里的生意。所以这家客栈倒也是生
意兴隆。
LONG );
	set("exits", ([
                "west" : __DIR__"shiya",
	]));
	set("objects", ([
		"/d/city/npc/xiaoer2" : 1,
                "/clone/npc/walker" : 1,
                __DIR__"npc/dizi" : 2,
	]));
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

