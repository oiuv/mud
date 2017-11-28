// Room: /lingzhou/xiaoba.c
// Java Sep.23 1998

#include <room.h>

inherit ROOM;

void create()
{
	set("short", "小坝");
	set("long", @LONG
这里是黄河边的一条小支流大柳河与黄河汇合的地方，当地百
姓为了防止黄河的泥沙倒灌进大柳河而在这里修了一座小小的石坝，
小坝不高，有三孔泄沙的洞，一扇结实的石闸门，两边是绞盘用来
控制闸门的升降。小坝使得大柳河两岸的百姓免受了黄河泥沙的侵
扰。
LONG	);
	set("exits", ([
		"northeast" : __DIR__"huangyangtan",
		"southwest" : __DIR__"qingtongxia",
	]));
	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}


