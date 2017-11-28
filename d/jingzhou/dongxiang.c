// Copyright (C) 2003, by Lonely. All rights reserved.
// This software can not be used, copied, or modified 
// in any form without the written permission from authors.

#include <room.h>
inherit ROOM;

void create()
{
	set("short", "闺房");
	set("long", @LONG
这是凌小姐的闺房，一股幽香扑面而来。一张绣榻放在墙角，垂着细
纱。凌小姐正对着一盆菊花在沉思。北面是座花园。
LONG );

	set("exits", ([
		"west" : __DIR__"houyuan",
		"north" : __DIR__"huayuan",
	]));

	set("objects", ([
		__DIR__"npc/shuanghua" : 1,
	]));
	
	setup();
	replace_program(ROOM);
}

