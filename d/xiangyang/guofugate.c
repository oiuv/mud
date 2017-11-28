// Room: /d/xiangyang/guofugate.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;
#include <ansi.h>;
void create()
{
	set("short", "郭府大门");
	set("long", 
"一座建筑古朴的大宅院出现在你的眼前。只见门楼高挑，
上书两个大字"HIY"
                     郭   府
"NOR"
    全真教第二代弟子耶律齐和几个家丁站在门前接待前来保
卫襄阳的各方义士。\n"
 );
    set("outdoors", "xiangyang");
	set("exits", ([
		"south" : __DIR__"westjie1",
		"north" : __DIR__"guofuyuan",
	]));
	set("objects", ([
		__DIR__"npc/yelvqi" : 1,
		__DIR__"npc/jiading" : 2,
	]));
	setup();
	replace_program(ROOM);
}

