inherit ROOM;

void create()
{
	set("short","中心广场");
	set("long",@LONG
这里就是阳苜咩城的中心，彩色石块铺成的大道向四方
伸延。广场呈菱形，一圈围的都是小贩，艺人，和看热闹的。
熙熙攘攘的人群中也少不了几个跑江湖之人，一些在中原闻
所未闻的事物令一些刚入江湖之人兴奋不已。
LONG);
	set("objects", ([
	   	__DIR__"npc/jianghuyiren": 1,
	]));
	set("outdoors", "dali");
	set("exits", ([
	    	"north"  : __DIR__"taihejiekou",
	    	"south"  : __DIR__"shizilukou",
	    	"east"   : __DIR__"taiheju",
	]));
	setup();
	replace_program(ROOM);
}

