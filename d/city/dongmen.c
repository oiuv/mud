inherit ROOM;

string look_gaoshi();

void create()
{
	set("short", "东门");
	set("long", @LONG
这是东城门，城门正上方刻着“东门”两个楷书大字，城
墙上贴着几张官府告示(gaoshi)。官兵们警惕地注视着过往行
人，你最好小心为妙。一条笔直的青石板大道向东西两边延伸。
东边是郊外，隐约可见一片一望无际的树林，神秘莫测。西边
是城里。北面有一片茂盛的青竹林。
LONG );
        set("outdoors", "city");
	set("item_desc", ([
		"gaoshi" : (: look_gaoshi :),
	]));
	set("exits", ([
		"east" : "/d/taishan/yidao",
		"north" : __DIR__"ml1",
		"south" : __DIR__"jiaowai1",
		"west" : __DIR__"dongdajie2",
	]));
	set("objects", ([
                "/d/beijing/npc/ducha" : 1,
		__DIR__"npc/bing" : 4,
                "/clone/npc/walker" : 1,
	]));

	setup();
    //replace_program(ROOM);
}

string look_gaoshi()
{
	return FINGER_D->get_killer() + "\n扬州知府\n程药发\n";
}

