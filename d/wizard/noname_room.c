// /d/wizard/guest_room.c

#include <room.h>
#include <ansi.h>

inherit ROOM;

void create()
{
	set("short", HIR "匿名留言室" NOR);
	set("long", @LONG
如果您有问题留言给炎黄巫师但又不想其他玩家看到，那
么您可以在这里(post)，其他玩家将不能看到您的留言，在这
里您可以举报有问题的id和其他作弊行为，炎黄巫师将为您的
留言完全保密。
                                ==武林群侠传全体巫师==
LONG );

	set("exits", ([
		"east": __DIR__"hall", 
                "west": __DIR__"wizard_room",              
        ]));

	set("no_fight", 1);

	setup();
	"/clone/board/noname_b"->foo();
}

int valid_leave(object me, string dir)
{
	if (dir == "west" && ! wizardp(me))
		return notify_fail("只有巫师才能进去！\n");

	return ::valid_leave(me, dir);
}


