inherit ROOM;

void create()
{
	set("short", "田地");
	set("long", @LONG
这里是一大片农田。不远处有些村庄，炊烟袅袅升起。村
庄周围是一块块的田地，田里有一些正在耕作的农人。村里不
时传出一声声的犬吠。
LONG);
	set("exits", ([
		"southwest" : __DIR__"tiandi3",
		"north"     : __DIR__"huanghe1",
	]));
	set("objects", ([
		"/clone/quarry/gou" : 1,
	]));
	set("no_clean_up", 0);
	set("outdoors", "huanghe");
	setup();
	replace_program(ROOM);
}

