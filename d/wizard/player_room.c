// /d/wizard/guest_room.c

#include <room.h>
#include <ansi.h>

inherit ROOM;

int is_chat_room() { return 1; }

void create()
{
	set("short", HIG "玩家交流室" NOR);
	set("long", @LONG
这里是巫师和玩家交流非技术的地方，你可以在这里放松
下来，也可以随意贴张(post)，你将感受到这里远离江湖，没
有争斗也没有屠杀。祝君好运！

                                ==武林群侠传全体巫师==
LONG );

	set("exits", ([
		"northwest": __DIR__"guest_room",               
        ]));

	set("no_fight", 1);

	setup();
	"/clone/board/heroplayer_b"->foo();
        replace_program(ROOM);
}

