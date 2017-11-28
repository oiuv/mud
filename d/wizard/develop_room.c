// /d/wizard/guest_room.c

#include <room.h>
#include <ansi.h>

inherit ROOM;

int is_chat_room() { return 1; }

void create()
{
	set("short", HIM "游戏开发室" NOR);
	set("long", @LONG
这里是巫师和玩家交流的地方，为便于巫师统一管理，这
里只能发表(post)关于玩家对本游戏的见解以及开发建议或者
对游戏中某些问题的疑问，以供巫师参考。不能发表非该主题以外
的闲杂话题，如果发现经过多次提醒仍然继续者，将一律删除档案。
其他问题请到「英雄圣殿」(help herohall) 相应的地方发表，这
样便于巫师和玩家交流，也便于统一管理，提高效率！玩家可以在
此发表任何符合该主题的文章，巫师也将尽力回复之，并定期公布
开发进度和计划以供玩家参考，欢迎提出意见！
                                    ==武林群侠传全体巫师==
LONG );

	set("exits", ([
		"southwest": __DIR__"guest_room",               
        ]));

	set("no_fight", 1);

	setup();
	"/clone/board/develop_b"->foo();
        replace_program(ROOM);
}

