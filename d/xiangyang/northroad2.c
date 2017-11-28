// Room: /d/xiangyang/northroad2.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "北内大街");
	set("long", @LONG
这是一条用青石铺就的大道。只见北面不时的有马车飞奔
而出，噢，北面是车行。向西就是丁字街口，东面也是一个大
街口，你好象看到一条大街通向南面。南面是一堵上盖红色琉
璃瓦的高墙，里面是襄阳守城大将王坚的府邸。
LONG );
        set("outdoors", "xiangyang");

	set("no_clean_up", 0);
	set("exits", ([
		"east"  : __DIR__"jiekou2",
		"west"  : __DIR__"dingzi",
		"north" : __DIR__"majiu",
	]));
	setup();
	replace_program(ROOM);
}

