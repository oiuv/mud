// Room: /lingzhou/luorilin1.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "落日林");
	set("long", @LONG
落日林位于灵州的东北，在西夏王陵和灵州的中间，延绵百里，多
长的是红松。
LONG );
	set("exits", ([
		"north"     : __DIR__"dalu",
		"southwest" : __DIR__"dongmen",
	]));
	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

