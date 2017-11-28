#include <room.h>
#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "地安门广场");
	set("long", @LONG
这里就是地安门广场，灰色的城墙给人以庄严肃穆之感，往北通过紫禁城
的地安门就是城郊了。远远望去，紫禁城的轮廓益发显得雄伟高大，一条护城
河绕城而过。一条笔直的青石大道横贯东西，东边是地安门东街广场，西边是
地安门西街广场。南边通过一条小桥就是皇宫的北门了。
LONG NOR);
	set("exits", ([
		"south" : __DIR__"hgmen_n",
		"north" : __DIR__"di_dajie1",
	        "west" : __DIR__"di_xigc",
                "east" : __DIR__"di_donggc",
	]));
	set("objects", ([
		__DIR__"npc/bing1" : 2,
		__DIR__"npc/bing3" : 1,
		__DIR__"npc/old2" : 1,
		__DIR__"npc/kid1" : 1,
                "/clone/npc/walker" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

