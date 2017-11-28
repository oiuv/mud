// Room: /lingzhou/yipindayuan.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "一品堂大院");
	set("long", @LONG
这里是西夏一品堂的大院，青石铺就的石板路，从大门直通正北面
那座构筑巍峨的一品堂大厅。东面立着一个旗杆，杆上一面不知颜色的
锦旗挺精神地飘扬着，杆后是个低矮一些的回廊厅堂。西面一排平房看
那样子也象是帐房。大院里有几棵老树撑着几片树荫，中央有一些武士
在练拳。
LONG );
	set("valid_startroom", 1);
	set("exits", ([
		"north"  : __DIR__"yipindating",
		"south"  : __DIR__"yipingate",
		"east"   : __DIR__"yipinjieyin",
		"west"   : __DIR__"yipinzhang",
	]));
	set("objects", ([
		__DIR__"npc/yun" : 1,
		__DIR__"npc/yipinwushi" : 2,
	]));
	setup();
	create_door("south" , "铜皮大门", "north" , DOOR_CLOSED);
	//replace_program(ROOM);
}
