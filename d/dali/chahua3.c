inherit ROOM;

void create()
{
	set("short","茶花园");
	set("long",@LONG
大理茶花冠绝天下，镇南王府的茶花自然更非凡品。你
正走在茶花园中，层层密密的都是争奇斗妍的茶花。靠南岸
边一溜的盆栽的茶花，微风从水面吹来，摇曳婆娑。
LONG);
	set("objects", ([
	   	__DIR__"obj/chahua8": 1,
	   	__DIR__"obj/chahua9": 1,
	   	__DIR__"obj/chahua10": 1,
	]));
	set("outdoors", "dali");
	set("exits", ([
	    	"southwest"  : __DIR__"chahua2",
	    	"north"      : __DIR__"chahua6",
	    	"southeast"  : __DIR__"chahua5",
	]));
	setup();
	replace_program(ROOM);
}

