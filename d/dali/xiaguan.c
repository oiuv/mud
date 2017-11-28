//Room: /d/dali/xiaguan.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","下关城");
	set("long",@LONG
下关城，又名龙尾城，为阁罗凤所筑，唐代已极繁荣。城区萦抱
苍山南麓数里，洱水绕城南而过，端的风景如画。此去南边不远即是
大理城，东面有太和城，另有道路通向西北。此附近居民以乌夷、台
夷为主，也有少量摆夷。
LONG);
	set("objects", ([
	   __DIR__"npc/tshangfan": 1,
	   __DIR__"npc/wshangfan": 1,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "northeast"  : __DIR__"cangshan",
	    "northwest"  : __DIR__"cangshanzhong",
	    "south"      : __DIR__"ershuiqiao",
	]));
	setup();
	replace_program(ROOM);
}

