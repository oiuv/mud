#include <room.h>
inherit ROOM;

void create()
{
	set("short", "西长安街");
	set("long", @LONG
热闹的西长安大街是紫禁城的交通要道，宽阔的青石大道向东西两头延伸，
街道上行人不断，繁华的盛世景象不言而喻。在这里可以远远望见东边那一堵
堵高大厚实的古城墙，便是著名的天安门广场了。北面是繁华的西单，左边不
远处有一家规模不大的客店。南面的街道逐渐狭窄，便是杨柳胡同的胡同口了。
LONG );
       set("exits", ([
		"east" : __DIR__"caroad_w2",
		"west" : __DIR__"kedian",
		"north" : __DIR__"xi_1",
		"south" : __DIR__"yangliu1",
	]));
	set("objects", ([
		__DIR__"npc/kid1" : 1,
		__DIR__"npc/haoke1" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

