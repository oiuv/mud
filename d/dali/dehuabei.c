//Room: /d/dali/dehuabei.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","南诏德化碑");
	set("long",@LONG
南诏阁逻风于大唐天宝年间，同大唐两次交战，歼唐军十六万。
过后，阁逻风有悔意，为一时交恶，“岂顾前非，而忘大礼”。于是，
派人收拾唐军阵亡将士，“祭而葬之，以存恩旧”，同时，令人撰文，
详记天宝战争的近因和结果，表达不得已而叛唐的苦衷，将它刻成巨
碑，于天宝十一年立于王都太和城国门外。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "north"  : __DIR__"road3",
	    "south"  : __DIR__"taihecheng",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

