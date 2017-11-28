// /d/wizard/guest_room.c

#include <room.h>
#include <ansi.h>

inherit ROOM;

int is_chat_room() { return 1; }

void create()
{
	set("short", HIC "BUG留言室" NOR);
	set("long", @LONG
这里是巫师处理玩家提出的bug的地方，为便于巫师统一管
理和玩家参看巫师解决后的反馈， 这里只能发表(post)有关游
戏bug问题，以供巫师解决。不能发表非该主题以外的闲杂话题， 
如果发现经多次提醒仍然继续者，将一律删除其档案。如果您有
其他问题请您到「英雄圣殿」(help herohall) 相应的地方发表，
这样便于巫师和玩家交流，也便于统一管理，提高效率！玩家可
以在此发表任何符合该主题的文章，巫师也将尽力解决并回复之。
★注意：如果您发现bug请将文章标题定为：“关于xxx的bug”，
并注明若有bug分加到哪个id上，请将您发现bug的详细情况描述
清楚最好能引用原文。请严格按照该格式发表，否则一切后果自
负。
                                  ==武林群侠传全体巫师==
LONG );

	set("exits", ([
		"west": __DIR__"guest_room",               
        ]));

	set("no_fight", 1);

	setup();
	"/clone/board/bug_b"->foo();
        replace_program(ROOM);
}

