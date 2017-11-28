//Room: /d/dali/shanjian.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","林中山涧");
	set("long",@LONG
密林深处豁然开朗，一道激流从上上飞溅下来，山涧并不宽，更
谈不上深，行人尽可徒步通过。涧水清凉干净，路人往往停下来用竹
筒装水解渴。四面皆是青竹林，竹叶随山风沙沙作响。有些摆夷村民
不远数里上山来采新鲜竹笋为食。
LONG);
	set("objects", ([
	   __DIR__"npc/caisunren1": 1,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "northdown"  : __DIR__"milin",
	    "southdown"  : __DIR__"banshan",
	]));
	setup();
	replace_program(ROOM);
}

