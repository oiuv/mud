//Room: /d/dali/road1.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","御街");
	set("long",@LONG
这里就是大理的皇宫前御街，北面宫门上的匾额写着‘圣慈宫’
三个金字。大理保定帝段正明已到天龙寺出家为僧了，大理的军国大
事就都在镇南王府处置了。
LONG);
	set("outdoors", "dali");
	set("objects",([
	    __DIR__"npc/weishi2": 1,
	]));
	set("exits",([ /* sizeof() == 1 */
	    "east"  : __DIR__"paifang",
	    "north" : __DIR__"gongmen",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

