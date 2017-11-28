// Room: /d/xiangyang/westgate1.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;
#include <ansi.h>;

void create()
{
	set("short", "白虎内门");
	set("long", 
"这里是襄阳城的西城门的内城门，只见城门上方是三个大
字。"HIW"

                      白虎门
\n"NOR
"近年来蒙古屡次侵犯襄阳城，故这儿把守相当严密，一些官兵
们正在盘查要离襄阳城的人。两边是上城头的石阶，向东进入
城区。\n"
 );
        set("outdoors", "xiangyang");

	set("exits", ([
		"southup" : __DIR__"wallw2",
		"northup" : __DIR__"wallw1",
		"east"    : __DIR__"westjie3",
		"west"    : __DIR__"westgate2",
	]));
	set("objects", ([
		__DIR__"npc/pi"   : 1,
		__DIR__"npc/bing" : 2,
	]));
	setup();
	replace_program(ROOM);
}

