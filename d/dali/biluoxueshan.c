inherit ROOM;

void create()
{
	set("short", "碧罗雪山");
	set("long", @LONG
你身处一片大雪山之中，此地只是半山腰，却已经积雪
皑皑，寒风刺骨了。仰头望去，银白的峰尖似在云中，天空
也蓝得特别深邃。由此向上的山颠杳无生命的踪迹，只向下
百丈的山腰便是树木苍郁、飞禽走兽横行的世界了。向东不
远有一条大河流过，在崇山峻岭之间冲击出一片谷地。
LONG);
	set("outdoors", "dali");
	set("exits", ([
                "eastdown" : __DIR__"shanlu2",
                "westdown" : __DIR__"lushuieast",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

