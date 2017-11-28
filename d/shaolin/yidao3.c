// Room: /d/shaolin/yidao4.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "大驿道");
	set("long", @LONG
你走在一条尘土飞扬的大驿道上。四周人来人往。挑担子的
行商，赶着大车的马夫，上京赶考的书生，熙熙攘攘，非常热闹。
不时还有两三骑快马从身边飞驰而过，扬起一路尘埃。道路两旁
是整整齐齐的杨树林。
LONG );
	set("exits", ([
		"south" : __DIR__"nanyang",
		"north" : __DIR__"ruzhou",
	]));
	set("outdoors", "nanyang");
	setup();
	replace_program(ROOM);
}
