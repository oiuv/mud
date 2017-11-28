inherit ROOM;

void create()
{
	set("short","司空堂");
	set("long",@LONG
这里是大理国司空堂。堂内无余物，四壁却堆满了书籍。
想来主人爱书如命，即便工余亦手不释卷。
LONG);
	set("objects", ([
	    	CLASS_D("duan") + "/ba" : 1,
	]));
	set("exits", ([
	   	"south"  : __DIR__"zonglichu",
	]));
	setup();
	replace_program(ROOM);
}

