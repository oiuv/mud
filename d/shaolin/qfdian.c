// Room: /d/shaolin/qfdian.c
// Date: YZC 96/01/19

#include <room.h>
inherit ROOM;

void create()
{
	set("short", "千佛殿");
	set("long", @LONG
这是千佛殿。大殿入口是朱红格扇，七宝玲珑。内里供奉的西
天诸佛，计有八菩萨，四金刚，五百阿罗，三千揭谛，十一大曜，
十八伽蓝，以及众优婆塞，优婆夷等。直看得你眼花缭乱。边上
有道小木门。
LONG );
	set("exits", ([
		"southdown" : __DIR__"guangchang5",
		"north" : __DIR__"bamboo1",		
	]));
	set("objects",([
		CLASS_D("shaolin") + "/qing-guan" : 1,
	]));
	create_door("north","木门","south",DOOR_CLOSED);
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

