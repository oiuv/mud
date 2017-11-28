// /guanwai/tulu.c

inherit ROOM;

void create()
{
	set("short", "土路");
	set("long", @LONG
这是一条用黄土铺就的道路。许多马车不断来往，似乎在搬运石料。
你抬头了望，一辆辆满载石料的车子往西北城中而去，而一辆辆的空车
却源源不断的开向东边。直弄得土路上尘土飞扬。
LONG );
	set("exits", ([
		"east" : __DIR__"shichang",
                "northwest" : __DIR__ "nancheng",
	]));

	set("outdoors", "guanwai");
	setup();
	replace_program(ROOM);
}

