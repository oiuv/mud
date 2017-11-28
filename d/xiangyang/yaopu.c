// Room: /d/xiangyang/yaopu.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "药铺");
	set("long", @LONG
药铺不大，却异常的整洁；正面是柜台，柜台后面是个大
柜子几百个小抽屉上一一用红纸标着药材的名称；靠近屋顶的
墙上悬着一块黑底金字的匾额，写着“妙手回春”。地下几个
伙计正在分拣刚刚收购来的草药。东边一张小矮桌儿，上面放
着笔墨纸砚，桌后坐着一位老郎中。一股刺鼻药味充满了整个
房间。
LONG );
	set("exits", ([
		"north" : __DIR__"eastjie1",
	]));
	set("objects", ([
		"/d/city/npc/huoji" : 1,
	]));
	setup();
	replace_program(ROOM);
}
