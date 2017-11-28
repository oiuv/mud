// Room: /d/xiangyang/northgate2.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;
#include <ansi.h>;

void create()
{
	set("short", "玄武外门");
	set("long", 
"这里是襄阳城的北城门，只见城门上方是三个大字。"HIB"

                      玄武门
\n"NOR
"近年来蒙古屡次侵犯襄阳城，故这儿把守相当严密，一些官兵
们正在盘查要离襄阳城的人。两边是很大的草地。\n"
 );
        set("outdoors", "xiangyang");

	set("exits", ([
		"south"  : __DIR__"northgate1",
		"north"  : __DIR__"caodi3",
		"east"   : __DIR__"caodi1",
		"west"   : __DIR__"caodi2",
	]));
	set("objects", ([
		__DIR__"npc/pi"   : 1,
		__DIR__"npc/bing" : 2,
	]));
	setup();
	replace_program(ROOM);
}

