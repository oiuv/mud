#include <room.h>
inherit ROOM;

void create()
{
	set("short", "烟草店");
	set("long", @LONG
从云南运来的烟土在这里可以说是最佳的商品，他的利润是成百成千倍的
翻了上去，开封现在最流行的送礼的方式就送烟。但是永远记住吸烟是有害健
康的，所以这里的老板被鸡蛋打在头上。发昧心财的人总是被人唾骂的。
LONG );
       set("exits", ([
		"north" : __DIR__"caroad_e2",
	]));
	set("objects", ([
		__DIR__"npc/old2" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

