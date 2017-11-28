inherit ROOM;
#include <ansi.h>

void create()
{
	set("short", "玄冥谷");
	set("long", @LONG
这是玄冥谷了，但见四周群峰围绕，山石掩映，前方不远
处有几间小屋(room)，偶有山鹿追逐嬉戏，飞鸟齐鸣，犹如置
身于世外桃源一般。远远望见玄冥峰上白雪一片，云雾缭绕于
四周，令人心旷神怡。
LONG );
	set("exits", ([
		"southup"    : __DIR__"shanlu3",
		"northwest"  : __DIR__"shanlu4",
                "enter"      : __DIR__"xiaowu",
	]));

        set("objects", ([
                "/kungfu/class/xuanming/lu" : 1,
        ]));

        set("item_desc", ([
                "room"  : NOR + YEL "一间简陋的茅草屋，可以在里面休息练功。\n" NOR,
        ]));

	set("outdoors", "xuanming");
	setup();
	replace_program(ROOM);
}
