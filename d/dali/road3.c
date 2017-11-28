//Room: /d/dali/road3.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","官道");
	set("long",@LONG
你走在一条青石官道上，这里已经是南诏境内了，路上时时可以
看到各色各样的商人来来往往，络驿不绝。路边站了些个衣饰华艳的
摆夷女子，其中一个身穿白衣的显得格外秀丽。此去向南即是大理国
北关口太和城，沿官道向东北可达中原。
LONG);
	set("objects", ([
	   __DIR__"npc/girl": 1,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "northeast"  : __DIR__"road2",
	    "south"      : __DIR__"dehuabei",
	    "northwest"  : "/d/wanjiegu/riverside2",
	]));
	setup();
	replace_program(ROOM);
}

