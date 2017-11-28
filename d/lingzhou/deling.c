// Room: /lingzhou/deling.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "德陵");
	set("long", @LONG
这就是李元昊的父亲赵德明的陵墓。宽十米高五米，为整个王陵中
最高大也是最完整的建筑。陵前左右各有两个石人武士护卫，陵前有汉
白玉栏杆围成的平台，上面石桌石凳一应俱全。
LONG );
	set("exits", ([
		"south"   : __DIR__"chiling",
		"north"   : __DIR__"gongling",
	]));
	set("objects", ([
		__DIR__"npc/shiwushi" : 2,
	]));
//	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

