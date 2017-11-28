
inherit ROOM;

void create()
{
	set("short", "大驿道");
	set("long", @LONG
你走在一条尘土飞扬的大驿道上。四周人来人往。挑担子的、
行商的、赶着大车的马夫、上京赶考的书生，熙熙攘攘，非常热闹。
不时还有两三骑快马从身边飞驰而过，扬起一路尘埃。道路两旁是
整整齐齐的杨树林。从这里向北向西都可以上京城。南边通往汝州
城。
LONG );
	set("exits", ([
		"north" : __DIR__"road3",
		"west" : __DIR__"road7",
		"south" : __DIR__"road8",
	]));
	set("objects",([
		"/d/taishan/npc/jian-ke" : 1,
	]));
 	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

