#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "马庄");
	set("long",
"这里一座颇为豪华的大宅院出现在你的眼前，两头高大的
石狮子镇住了大门两侧，朱漆大门足足有三寸厚。门上挂着两
个灯笼，写着「" HIW "马庄" NOR "」二字。马大元乃丐帮副帮主，以其家传
绝技三十二势锁喉擒拿手震烁江湖，在武林中威名远扬。
");
        set("outdoors", "city");
	set("exits", ([
		"south" : __DIR__"xidajie2",
		"north" : __DIR__"ma_dayuan",
	]));
	set("objects", ([
		"/d/gaibang/npc/1dai" : 1 + random(2),
		"/d/gaibang/npc/2dai" : 1 + random(2),
	]));	
	setup();
	replace_program(ROOM);
}
