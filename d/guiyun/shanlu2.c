// Room: /guiyun/shanlu2.c
// Date: Nov.18 1998 by Winder

inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
这里是一片农田。不远处有一些村庄，炊烟袅袅升起。村庄周围
是一块块的田地，田里有一些正在耕作的农人。
LONG );
        set("outdoors", "guiyun");
	set("exits", ([
		"southwest" : __DIR__"shanlu1",
		"southeast" : "/d/suzhou/road1",
	]));
	setup();
	replace_program(ROOM);
}
