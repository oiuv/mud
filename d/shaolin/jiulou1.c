// Room: /shaolin/jiulou1.c
// YZC 1995/12/04 

inherit ROOM;

void create()
{
	set("short", "迎宾楼");
	set("long", @LONG
方圆数百里内提起迎宾楼可以说是无人不知，无人不晓。当年苏
学士云游到此，对迎宾楼的素齐赞不绝口，欣然为其题匾，流下一段
传遍海内的佳话，从此迎宾楼名声大震。楼下布置简易，顾客多是匆
匆的行人，买点包子，鸡腿、米酒就赶路去了。楼上是雅座。
LONG );
	set("exits", ([
		"east" : __DIR__"nanyang",
		"up" : __DIR__"jiulou2",
	]));
	set("objects", ([
		__DIR__"npc/xiao-er2" : 1,
	]));
	set("no_clean_up", 0);
	set("no_fight", "1");
	setup();
	replace_program(ROOM);
}

