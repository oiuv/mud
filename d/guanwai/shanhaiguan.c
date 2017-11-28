// /guanwai/shanhaiguan.c
inherit ROOM;

void create()
{
	set("short", "山海关");
	set("long", @LONG
这里就是万里长城最东面的重要关口--山海关。这里地势险要，自古就
是关外通往中原的必经之地。站在关楼上北望，角山，古堡，烽火台历历在
目，南沿长城远眺，直深入海的老龙头依稀可见。城楼二楼上悬挂着一块巨
幅横匾(bian)。
LONG );
	set("exits", ([
		"northeast" : __DIR__"road1",
		"southeast" : __DIR__"laolongtou",
	]));
	set("objects", ([
		"/d/city/npc/wujiang" : 1,
		"/d/city/npc/bing"    : 2,
	]));
	set("item_desc",([
		"bian" : 
"
    ※※※※※※※※※※※※※※※※※※※
    ※※※※　　　　　　　　　　　※※※※
    ※※※※　天  下  第  一  关  ※※※※
    ※※※※　　　　　　　　　　　※※※※
    ※※※※※※※※※※※※※※※※※※※\n",
	]));
	set("no_clean_up", 0);
	set("outdoors", "guanwai");
	setup();
	replace_program(ROOM);
}

