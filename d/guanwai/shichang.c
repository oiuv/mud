// /guanwai/shichang.c

#include <room.h>

inherit PRODUCING_ROOM;

void create()
{
	set("short", "采石场");
	set("long", @LONG
这里是山脚，眼前蓦然耸立着一座大山，不过一侧已经被炸得支离
破碎，工人们来来往往，搬运着石料。在北方也有这么大的石山，你不
禁有些惊讶。眼前有一个人，看起来像个监工。
LONG );
	set("exits", ([
		"west" : __DIR__"tulu",
	]));

        set("objects", ([
                __DIR__"npc/jiangong" : 1,
        ]));

        set("no_fight", 1);

        set("product/stone", ([ "name" : "石料",
                                "rate" : 1000,
                                "max"  : 200000, ]));

	set("outdoors", "guanwai");
	setup();

        set_heart_beat(120);
}
