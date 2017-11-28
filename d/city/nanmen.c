inherit ROOM;

string look_gaoshi();

void create()
{
	set("short", "南门");
	set("long", @LONG
这是扬州城的南城门，城墙被当成了广告牌，贴满了花花
绿绿各行各业的广告，官府的告示(gaoshi)因此不太显目。官
兵们被近处的欢声笑语所吸引，似乎不是很认真在执勤。一条
笔直的青石板大道向南北两边延伸。
LONG);
	set("outdoors", "city");
	set("item_desc", ([
		"gaoshi" : (: look_gaoshi :),
	]));

	set("exits", ([
		"south" : "/d/wudang/wdroad1",
		"north" : __DIR__"nandajie2",
		"west"  : __DIR__"jiaowai8",
		"east"  : __DIR__"jiaowai7",
	]));
        set("objects", ([
                __DIR__"npc/wujiang" : 2,
                __DIR__"npc/bing" : 4,
                __DIR__"npc/shisong" : 1,
                "/clone/npc/walker" : 1,
        ]));
        setup();
        //replace_program(ROOM);
}

string look_gaoshi()
{
	return FINGER_D->get_killer() + "\n扬州知府\n程药发\n";
}

