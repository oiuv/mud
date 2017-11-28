
inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
这里是荒凉的山路，只有一条蜿蜒崎岖的小径。
LONG );
	set("exits", ([
		"northup" : __DIR__"shanlu2",
                "eastdown": __DIR__"zhuang1",
	]));
 	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}
