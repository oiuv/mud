#include <room.h>
inherit ROOM;

void create()
{
	set("short", "西大街");
	set("long", @LONG
这是灵州西大街，街道宽敞而干净，青砖砌的路面被雨水冲得光明
如镜，街道两侧的瓦房高大而宏伟，双人合抱的杨树十步一株，整齐地
排在两边。大街北面一对大红灯笼，悬挂在朱门两旁。这里就是一品堂
总坛。大街南面有几家店铺，街道有点冷清。
LONG );
	set("exits", ([
		"south" : __DIR__"daodian",
		"north" : __DIR__"yipingate",
		"east"  : __DIR__"center",
		"west"  : __DIR__"biaoqiyin",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

