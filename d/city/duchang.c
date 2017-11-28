inherit ROOM;

void create()
{
	set("short", "赌场");
	set("long", @LONG
这里是赌场的大堂，四周的房间里传出来吆五喝六的赌博
声。这个赌场规模虽算不上很大，但赌的种类却很齐全，服务
也非常周到。
LONG );
	set("objects", ([
		CLASS_D("shenlong") + "/pang" : 1,
                "/d/beijing/npc/duke" : 2,
                "/d/beijing/npc/haoke1" : 2,
	]));
	set("exits", ([
		"west" : __DIR__"daxiao",
		"up"   : __DIR__"duchang2",
		"north": __DIR__"bet",
		"east" : __DIR__"nandajie1",
	]));
	setup();
        replace_program(ROOM);
}

