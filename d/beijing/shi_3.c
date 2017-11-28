#include <room.h>
inherit ROOM;

void create()
{
	set("short", "西四北大街");
	set("long", @LONG
这里是西四北大街的尽头，青石铺砌大道相当宽阔，街道上的行人熙熙攘
攘，车马穿流不息。东边接地西大街，转南则通过西四南大街接京城的西单北
大街。
LONG );
       set("exits", ([
		"east" : __DIR__"di_4",
		"south" : __DIR__"shi_2",
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

