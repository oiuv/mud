inherit ROOM;

void create()
{
        set("short", "林间道");
        set("long", @LONG
这里是一条林间小道，在树丛中蜿蜒。岭南山林茂密，多
产毒虫，所以路人经过此地都是非常的小心。
LONG);
	set("objects", ([
	        "/clone/beast/dushe": 1,
	]));
	set("outdoors", "foshan");
	set("exits", ([
	        "southwest" : __DIR__"road3",
	        "southeast" : __DIR__"road5",
	]));
	setup();
	replace_program(ROOM);
}
