#include <room.h>
inherit ROOM;

void create()
{
	set("short", "高升茶馆");
	set("long", @LONG
一座规模不小的茶馆，门前的幡上舞着“高升”两个大字。你刚进来，就
闻到一股茶香沁入心脾，精神为之一爽。几张八仙桌一字排开，坐满了客人，
或高声谈笑，或交头接耳。茶博士摇头晃脑的说着书，茶铺的伙计忙个不停。
你要想打听江湖掌故和谣言，这里是个好所在。
LONG );
       set("exits", ([
		"north" : __DIR__"caroad_w2",
	]));
	set("objects", ([
		__DIR__"npc/chaboshi" : 1,
		__DIR__"npc/teahuoji" : 1,
		__DIR__"npc/chake" : 2,
		__DIR__"npc/old2" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

