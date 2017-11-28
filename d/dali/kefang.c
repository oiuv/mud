inherit ROOM;

void create()
{
	set("short", "客房");
	set("long", @LONG
这是一间客房，靠墙放了一张梨木大床，上面的被褥尽
是苏绣，工美绝伦。正中放了一张八仙桌，几个奇服南人正
在高谈阔论。
LONG);
	set("objects", ([
	   	__DIR__"npc/peicong": 3,
	]));
	set("exits", ([
	    	"south" : __DIR__"zoulang2",
	]));
	setup();
	replace_program(ROOM);
}

