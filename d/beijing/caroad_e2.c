#include <room.h>
inherit ROOM;

void create()
{
	set("short", "东长安街");
	set("long", @LONG
热闹的东长安大街是紫禁城的交通要道，宽阔的青石大道向东西两头延伸，
街道上行人不断，繁华的盛世景象不言而喻。在这里可以远远望见西边那一堵
堵高大厚实的古城墙，便是著名的天安门广场了。北面是京城最为繁华热闹的
王府井大街。从南边传来一股浓烈的烟草气味，原来那里是一家烟草店。东边
是一家杂货铺。
LONG );
       set("exits", ([
		"north" : __DIR__"wang_2",
		"south" : __DIR__"yancao",
		"east" : __DIR__"zahuo",
		"west" : __DIR__"caroad_e1",
	]));
	set("objects", ([
		__DIR__"npc/old1" : 1,
		__DIR__"npc/hunhun" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

