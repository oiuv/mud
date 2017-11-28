// /d/wizard/guest_room.c

#include <room.h>
#include <ansi.h>

inherit ROOM;

int is_chat_room() { return 1; }

void create()
{
	set("short", HIG "文选发表室" NOR);
	set("long", @LONG
你可以在这里发表或转载文章，如被巫师选用将刊登出来。
注：禁止发表反动、暴力、淫秽、低俗的内容。
LONG );

	set("exits", ([
		"east"    :  __DIR__"herodoor",           
        ]));

	set("no_fight", 1);

	setup();
	"/clone/board/wenxuan_b"->foo();
        replace_program(ROOM);
}

