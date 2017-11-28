// Room: /qingcheng/tianshidong.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "天师洞");
	set("long", @LONG
天师洞以东汉张陵在此讲道修炼而得名，又名古常道观。洞在
山腰混元顶下峭壁间。中塑天师像，沿岩壁有廊可通。正殿名三皇
殿，重檐回廊，雄锯高台，气势宏伟。内供伏羲、神农、轩辕三皇
石刻造像。
LONG );
	set("exits", ([
		"northup"  : __DIR__"gulongqiao",
		"north"    : __DIR__"sanqingdian",
		"eastdown" : __DIR__"path2",
		"west"     : __DIR__"yinxing",
		"east"     : __DIR__"sandaoshi",
	]));
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

