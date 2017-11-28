// Room: /city/biaoju.c
// YZC 1995/12/04 

inherit ROOM;

void create()
{
	set("short", "福威镖局");
	set("long", @LONG
朱漆大门上茶杯大小的铜钉闪闪发光，门顶匾额写着“
福威镖局”四个金漆大字，下面横书“总号”两个小字。进
门处两排长凳，分坐八名劲装汉子，个个腰板笔挺，显出一
股英悍之气。
LONG );

	set("exits", ([
		"south" : __DIR__"xidajie",
		"enter" : __DIR__"biaojudy",
	]));
	set("objects", ([
		__DIR__"npc/chenqi" : 1,
		__DIR__"npc/baier" : 1,
	]));
	setup();
	replace_program(ROOM);
}

