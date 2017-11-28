//Room: /d/dali/wunong.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","乌弄城");
	set("long",@LONG
此处已到大理的北疆，是乌蒙的珙部的治府，乌蒙属乌夷，居民
多居于高山上。这里正处高山之腰，北临波涛汹涌的大渡河。巷陌皆
用山石垒成，高丈余，延绵全城。此城不大，四面山上分布着些乌蒙
民居，有牧人赶着牛羊穿镇而过。
LONG);
	set("objects", ([
	   __DIR__"npc/wshangfan": 1,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "northdown"  : __DIR__"daduhe",
	    "southdown"  : __DIR__"shanlu1",
	    "east"       : __DIR__"wumeng",
	]));
	setup();
	replace_program(ROOM);
}

