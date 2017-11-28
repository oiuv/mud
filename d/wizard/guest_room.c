
#include <room.h>
#include <ansi.h>

inherit ROOM;

int is_chat_room() { return 1; }

void create()
{
	set("short", HIY "巫师会客室" NOR);
	set("long", @LONG
这里是巫师和玩家交流的地方，在这里你可以和巫师畅所
欲言，无拘无束。
LONG );

	set("exits", ([
		"west": __DIR__"hall",
		"southeast"  : __DIR__"player_room",
                "northeast"  : __DIR__"develop_room",
                "east"       : __DIR__"bug_room"
        ]));

	set("no_fight", 1);

	setup();
        replace_program(ROOM);
}
