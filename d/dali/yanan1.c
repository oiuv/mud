//Room: /d/dali/yanan1.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","滇池沿岸");
	set("long",@LONG
滇池名曰池，实际上是个很大的湖，四面山上水源众多，也浇灌
了大片的农田。池水清澈凉爽，许多罗伽部的妇女在此洗衣挑水。摆
夷并不以渔业为主，不过岸边仍然建有小码头，时常有游船停靠，也
有少量竹舟下水打鱼。西边有条弯弯曲曲的小路沿着滇池南岸而去。
LONG);
	set("objects", ([
	   __DIR__"npc/cunfu": 2,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "northeast" : __DIR__"luojiadian",
	    "west"      : __DIR__"yanan2",
	]));
	setup();
	replace_program(ROOM);
}

