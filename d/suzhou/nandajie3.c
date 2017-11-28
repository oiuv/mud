inherit BUILD_ROOM;

void create()
{
	set("short", "南大街");
	set("long", @LONG
你走在一条繁华的街道上，向南北两头延伸。北边通往城
南大街的中心地段，东面是听雨轩，西面是留园，望南面，是
苏州城的南城门。所谓上天天堂，下有苏杭，此言的确不错。
如果在这里生活绝对是人间福地。
LONG );
	set("outdoors", "suzhou");
	set("exits", ([
		"east"  : __DIR__"chaguan",
		"west"  : __DIR__"shuyuan",
		"north" : __DIR__"nandajie1",
		"south" : __DIR__"nandajie2",
	]));
        set("max_room", 5);
	setup();
}

