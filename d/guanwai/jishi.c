// /guanwai/jishi.c

inherit ROOM;

void create()
{
	set("short", "集市");
	set("long", @LONG
这里是城中一片开阔的广场，乃是来往客商交易毛皮，药材以及其它杂
物的集市。由于附近方圆百里仅有这么一个集市，因此这里的人最多，货物
也最全。不同的服饰，不同的语言都可以在这里看到，听到。杂乱的人群中
传出各种吆喝，叫卖的声音。
LONG );
	set("exits", ([
		"north" : __DIR__"beicheng",
		"south" : __DIR__"nancheng",
		"east"  : __DIR__"dongcheng",
		"west"  : __DIR__"kedian",
	]));
	set("objects", ([
		__DIR__"npc/pihuoshang" : 3,
                __DIR__"npc/hadani" : 1,
	]));
	set("outdoors", "guanwai");
	setup();
	replace_program(ROOM);
}

