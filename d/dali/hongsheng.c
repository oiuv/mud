inherit ROOM;

void create()
{
	set("short","宏圣寺塔");
	set("long",@LONG
宏圣寺塔又名“一塔”，屹立于苍山之麓，面向洱海，为云南著
名唐塔之一。宏圣寺塔为四方形空心砖石塔，塔身各层之间用砖砌出
跌涩椽，使其四角飞翘。整个塔身轮廓呈抛物线，优美流畅。
LONG);
	set("exits", ([
                "west"  : __DIR__"cangshan",
                "enter" : __DIR__"hongsheng1",
                "south" : "/d/tianlongsi/damen",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

