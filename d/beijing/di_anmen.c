#include <room.h>
#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "地安门");
	set("long", @LONG
这里是是紫禁城地安门，高大的城门正上方刻着“地安门”三个大字，厚
实坚固的古城墙高高耸立着。城门两旁整齐的站着几个卫兵，仔细的监守着这
里。南方由地安门大街通往京城的中心。
LONG );
	set("exits", ([
		"north" : __DIR__"gate",
		"south" : __DIR__"di_dajie2",
	]));
	set("objects", ([
		__DIR__"npc/ducha" : 1,
		__DIR__"npc/bing2" : 1,
		__DIR__"npc/bing3" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

