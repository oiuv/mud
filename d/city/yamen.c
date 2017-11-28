#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "衙门大门");
	set("long", @LONG
这里是衙门大门，两扇朱木大门紧紧关闭着。「肃静」和
「回避」的牌子分放两头石狮子的旁边。前面有一个大鼓，显
然是供小民鸣冤用的。几名衙役在门前巡逻。
LONG );
	set("exits", ([
		"south" : __DIR__"xidajie1",
		"north" : __DIR__"ymzhengting",
	]));
	set("objects", ([
		__DIR__"npc/yayi" : 4,
	]));
	setup();
}

int valid_leave(object me, string dir)
{
	if (objectp(present("ya yi", environment(me)))
           && dir == "north")
		return notify_fail(CYN "衙役齐声喝道：威……武……\n" NOR);

	return ::valid_leave(me, dir);
}
