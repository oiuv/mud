inherit ROOM;

void create()
{
	set("short", "北大街");
	set("long", @LONG
你走在北大街的青石地上，发现这里热闹非凡。原来东北
角就是金牛武馆，据说每个武师都有绝活。许多江湖人物都慕
名前来，搬运行李被褥的人不绝如缕。往东南是东大街，一直
向西的是北大街。
LONG );
        set("outdoors", "chengdu");
	set("exits", ([
	    	"west"       : __DIR__"northroad2",
	    	"southeast"  : __DIR__"eastroad1",
	    	"northeast"  : __DIR__"wuguan",
	]));
	set("objects", ([
	    	"/d/huashan/npc/haoke" : 2,
	    	"/d/taishan/npc/jian-ke" : 1,
	]));
	setup();
	replace_program(ROOM);
}
