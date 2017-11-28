
inherit ROOM;

void create()
{
	set("short", "小路");
	set("long", @LONG
你走在一条小路上。前面道路崎岖，行人很少。前方隐约有房屋可见。
LONG );
	set("exits", ([
		"south" : __DIR__"zhuang1",
		"north" : __DIR__"zhuang3",
	]));
	set("objects", ([
		"/d/wudang/npc/tufei1" : 1,
	]));
 	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}
