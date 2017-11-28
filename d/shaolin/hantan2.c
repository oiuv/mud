// Room: /d/shaolin/hantan2.c
// Date: YZC 96/02/06

#include <room.h>
inherit ROOM;

void create()
{
	set("short", "万古寒潭");
	set("long", @LONG
这是寒潭之中。从这里已可感觉到深水下的巨大压力，彻骨
冰凉的潭水在身体四周凝成一层薄薄的冰壳，四肢也已开始麻木，
令你感到举手投足都甚为困难。水中的吸力也渐渐加强，你不由
自主地往下沉去。
LONG );
	set("no_clean_up", 0);
	setup();
}

void init()
{
	call_out("down", 5, this_player());
}

void down(object me)
{
	tell_object(me, "只觉脚底水流盘旋，一股强大的吸力把你往下拉去...\n");
	me->move(__DIR__"hantan3");
}

