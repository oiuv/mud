inherit ROOM;

void create()
{
        set("short", "无乐阁");
        set("long",@LONG
这是历代大理王侯前来进香还愿时休息的地方。阁内檀象宝炉，软榻
矮几，一应俱全，清静之中隐然透出一丝富贵之象。
LONG );
        set("exits", ([
            "north": __DIR__"xianghemen",
            "east" : __DIR__"huangtianmen",
	]));
	set("objects",([
             __DIR__"npc/xiaoshami" : 2,
        ]));
//        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
