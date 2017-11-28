inherit ROOM;

void create()
{
	set("short","兵器房");
	set("long",@LONG
这里是镇南王府的兵器房，四周放这几个兵器架，上面
是王府家人弟子平时练剑用的竹剑。
LONG);
	set("objects", ([
            	"/clone/weapon/zhujian" : 4,
            	"/clone/weapon/changbian" : 1
	]));
	set("exits", ([
	    	"south"  : __DIR__"chahua1",
	]));
	setup();
        replace_program(ROOM);
}
