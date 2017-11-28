//Room: /d/dali/qingxi.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","清溪三潭");
	set("long",@LONG
清溪三潭，又名翠盆水，隐藏在苍山马龙峰与圣应峰之间幽深的
峡谷中。山泉岩根涌出，喷珠泻玉，岩溪汇池，壮若大盆，分三叠，
水清石丽，翠碧交加，故俗称清碧溪。
LONG);
	set("objects", ([
	   __DIR__"npc/biaotou": 1,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "northup"   : __DIR__"dadieshui",
	    "eastup"    : __DIR__"bijishan",
	    "southdown" : __DIR__"xiaodao1",
	]));
	setup();
	replace_program(ROOM);
}

