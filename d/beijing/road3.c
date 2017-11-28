
inherit ROOM;

void create()
{
	set("short", "大驿道");
	set("long", @LONG
你走在一条尘土飞扬的大驿道上。四周人来人往。挑担子的、
行商的，赶着大车的马夫，上京赶考的书生，熙熙攘攘，非常热闹。
不时还有两三骑快马从身边飞驰而过，扬起一路尘埃。道路两旁是
整整齐齐的杨树林。东北方向是另一条大道。
LONG );
	set("exits", ([
		"northeast" : "/d/guanwai/laolongtou",
		"northwest" : __DIR__"road2",
		"south"     : __DIR__"road4",
	]));
	set("objects",([
		"/d/taishan/npc/shu-sheng" : 1,
	]));
 	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}
