inherit ROOM;

void create()
{
	set("short","茶花园");
	set("long",@LONG
大理茶花冠绝天下，镇南王府的茶花自然更非凡品。你
站在茶花园的最高处，低头看去，满园春色，尽在目下。西
望亭台楼阁，错落有秩。
LONG);
	set("objects", ([
	   	__DIR__"obj/chahua7": 1,
	   	__DIR__"npc/muwanqing": 1,
	]));
	set("outdoors", "dali");
	set("exits", ([
	    	"southdown"  : __DIR__"chahua7",
	]));
	setup();
	replace_program(ROOM);
}

