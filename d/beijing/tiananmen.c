#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "天安门广场");
	set("long", @LONG
这里就是天安门广场，灰色的城墙给人以庄严肃穆之感，再往北通过金水
桥就是皇宫紫禁城了。远远望去，紫禁城的轮廓益发显得雄伟高大，一条护城
河绕城而过。一条笔直的青石大道横贯东西，东边是东长安街广场，西边是西
长安街广场。南边是宽阔繁华的长安街广场，往南经过凡陛桥一直延伸至天坛
和永定门。
LONG NOR);
	set("exits", ([
		"south" : __DIR__"cagc_s",
		"north" : __DIR__"qiao",
	        "west" : __DIR__"cagc_w",
                "east" : __DIR__"cagc_e",
	]));
	set("objects", ([
		__DIR__"npc/maiyi2" : 1,
		__DIR__"npc/bing1" : 2,
		__DIR__"npc/old2" : 1,
		__DIR__"npc/kid1" : 1,
                "/clone/npc/walker" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

