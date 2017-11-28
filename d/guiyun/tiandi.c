inherit ROOM;

void create()
{
	set("short", "田地");
	set("long", @LONG
这里是一片农田。不远处有一些村庄，炊烟袅袅升起。村
庄周围是一块块的田地，很有次序的排成一个个井字，田里有
些正在耕作的农人，过路人贪近路也可从田间穿过。
LONG);
        set("outdoors", "guiyun");
	set("exits", ([
		"northeast"  : __DIR__"shulin5",
		"west"       : __DIR__"yixing",
	]));
	set("objects", ([
		"/clone/quarry/niao" : 1,
	]));
	setup();
        replace_program(ROOM);
}
