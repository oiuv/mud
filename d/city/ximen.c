inherit ROOM;
string look_gaoshi();

void create()
{
	set("short", "西门");
	set("long", @LONG
这里是扬州城的西城门，几年前曾经遭到土匪的攻打，因
此显得有些破败。城门正上方勉勉强强可以认出「西门」两个
大字，城墙上贴着几张通缉告示(gaoshi)。这里是罪犯逃往西
域的必经之地，官兵们戒备森严，动不动就截住行人盘问。笔
直的青石板大道向东西两边延伸。西边是郊外，骑马的、座轿
的、走路的，行人匆匆。东边是城里。南边是滚滚长江，江边
是一个小小的渡口，可以通往中州府。
LONG);
        set("outdoors", "city");
	set("item_desc", ([
		"gaoshi" : (: look_gaoshi :),
	]));

	set("exits", ([
		"east"  : __DIR__"xidajie2",
		"west"  : __DIR__"ximenroad",
		"south" : "/d/zhongzhou/yangzhoudu",
	]));
        set("objects", ([
                "/d/beijing/npc/ducha" : 1,
                __DIR__"npc/bing" : 4,
                "/d/mingjiao/npc/fenggongying" : 1,
                "/clone/npc/walker" : 1,
        ]));
	setup();
	//replace_program(ROOM);
}

string look_gaoshi()
{
	return FINGER_D->get_killer() + "\n扬州知府\n程药发\n";
}

