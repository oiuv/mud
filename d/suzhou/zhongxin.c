inherit ROOM;

void create()
{
	set("short", "城中心");
	set("long", @LONG
此地便是苏州城的城中心，北侧是苏州有名的沧浪亭，连
接北大街，南侧则是宝带桥了。城中心环境相对幽雅，使得男
女老少都喜爱在这里闲庭散步。放眼望去，四周一片碧绿的草
坪，让人心旷神怡。
LONG );
	set("outdoors", "suzhou");
	set("exits", ([
		"east"  : __DIR__"dongdajie1",
		"west"  : __DIR__"xidajie1",
		"north" : __DIR__"canlangting",
		"south" : __DIR__"baodaiqiao",
	]));
        set("objects", ([
                "/d/beijing/npc/maiyi2" : 1,
                "/d/beijing/npc/old1" : 1,
                "/d/beijing/npc/kid1" : 1,
        ]));

	setup();
	replace_program(ROOM);
}

