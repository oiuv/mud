// Room: /shaolin/jiulou2.c
// YZC 1995/12/04 

inherit ROOM;

void create()
{
	set("name", "迎宾楼");
	set("short", "迎宾楼二楼");
	set("long", @LONG
这里是雅座，文人学士经常在这里吟诗作画，富商土豪也在这里
边吃喝边作交易。这里也是城里举办喜宴的最佳场所。你站在楼上眺
望，只觉得心旷神怡。东面是一池湖水，碧波荡漾。北面是崇山峻岭。
墙上挂着价格牌子(paizi)。
LONG );
	set("item_desc", ([
		"paizi" : "本店专办上等素齐。\n",
	]));
	set("exits", ([
		"down" : __DIR__"jiulou1",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

