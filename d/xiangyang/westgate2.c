// Room: /d/xiangyang/westgate2.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;
#include <ansi.h>;

void create()
{
	set("short", "白虎外门");
	set("long", 
"这里是襄阳城的西城门，只见城门上方是三个大字。"HIW"

                      白虎门
\n"NOR
"近年来蒙古屡次侵犯襄阳城，故这儿把守相当严密，一些官兵
们正在盘查要离襄阳城的人。两边是很大的草地。\n"
 );
        set("outdoors", "xiangyang");

	set("exits", ([
		"east"  : __DIR__"westgate1",
                "west"  : __DIR__"guandao_1",
	]));
	set("objects", ([
		__DIR__"npc/pi"   : 1,
		__DIR__"npc/bing" : 2,
	]));
	setup();
	replace_program(ROOM);
}

