#include <room.h>
inherit ROOM;

void create()
{
	set("short", "东大街");
	set("long", @LONG
这是灵州东大街，同样的宽阔与干净，相比西大街的冷清要热闹多
了，街上人来人往，熙熙攘攘，几个小孩正在胡同口玩耍，南面有不少
人围在一起，北面是衙门，路边有条狗正在追一只猫。
LONG );
	set("exits", ([
		"south" : __DIR__"jiangjungate",
		"north" : __DIR__"yamen",
		"west"  : __DIR__"center",
		"east"  : __DIR__"dongmen",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

