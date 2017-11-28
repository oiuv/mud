
inherit ROOM;

void create()
{
	set("short", "小路");
	set("long", @LONG
你走在一条小路上。前面道路崎岖，行人很少。西面有一条蜿蜒
的小岔路上山。
LONG );
	set("exits", ([
	        "southwest" : __DIR__"road1",
		"north"     : __DIR__"zhuang2",
                "westup"    : __DIR__"shanlu1",
	]));
	set("objects", ([
		"/d/taishan/npc/seng-ren" : 1,
	]));
 	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}
