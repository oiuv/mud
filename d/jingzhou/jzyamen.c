#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "荆州衙门");
	set("long", @LONG
这里是荆州衙门大门所在，衙门的两扇朱木大门紧紧关闭
着。“肃静”“回避”的牌子分放两头石狮子的旁边。前面有
一个大鼓，显然是供小民鸣冤用的。几名衙役在门前巡逻。
LONG);
	set("exits", ([
		"south" : __DIR__"ymzhengting",
		"north" : __DIR__"xidajie1",
	]));
	set("objects", ([
		__DIR__"npc/yayi" : 4,
	]));

	setup();
}

int valid_leave(object me, string dir)
{
	if (dir == "south" &&
           objectp(present("ya yi", environment(me))))
		return notify_fail(CYN "衙役齐声喝道：威……武……\n" NOR);
	return ::valid_leave(me, dir);
}
