//Room: /d/dali/yongdao2.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","甬道");
	set("long",@LONG
这是镇南王府的甬道。两边是密密的参天乔木，天光透过树叶，
在地上洒下星星斑点。石砌的甬道路面两侧，是如茵的绿草，点缀着
一星半点的小花，周围十分安静，偶尔虫鸣悠扬。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "north"      : __DIR__"neitang",
	    "east"       : __DIR__"chahua8",
	    "southwest"  : __DIR__"yongdao1",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

