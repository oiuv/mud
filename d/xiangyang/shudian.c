// Room: /d/xiangyang/shudian.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "书店");
	set("long", @LONG
这里的老板刚从南阳搬来，听说以前他曾在嵩山少林寺出
过家，后不知什么原因又还了俗，专门卖书为生。只见书店面
积很大，以前曾是一座勾栏。
LONG );
	set("exits", ([
		"east" : __DIR__"westroad2",
	]));
	set("objects", ([
		__DIR__"npc/shudianboss" : 1,
	]));
	setup();
	replace_program(ROOM);
}
