inherit ROOM;
void create()
{
	set("short", "北大街");
        set("long", @LONG
你走在一条繁忙的街道上，看着操着南腔北调的人们行色
匆匆，许多人都往南边走去，那里有一个热闹的广场。东边是
一家生意兴隆的客栈，来自各地的人们进进出出，据说也是情
人们的幽会地点。西边是一家钱庄，可以听到叮叮当当的金银
声音。
LONG );
        set("outdoors", "city");
	set("objects", ([
		CLASS_D("ouyang") + "/ouyangke" : 1,
	]));
	set("exits", ([
		"east"  : __DIR__"kedian",
		"south" : __DIR__"guangchang",
		"west"  : __DIR__"qianzhuang",
		"north" : __DIR__"beidajie2",
	]));
	setup();
        replace_program(ROOM);
}
