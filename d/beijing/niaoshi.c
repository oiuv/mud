#include <room.h>
inherit ROOM;

void create()
{
	set("short", "鸟市");
	set("long", @LONG
你一走到这里，便听见了许许由各种各样鸟儿轻脆的叫声编织成的动听的
梵籁。你可以看到很多京城里衣着华丽的公子哥儿在这里精挑细选，一个个
油头粉面，平时无事可作，就靠这些来打发着混日子。
LONG );
       set("exits", ([
		"east" : __DIR__"xi_1",
                "west" : __DIR__"majiu",
	]));
	set("objects", ([
		__DIR__"npc/richman1" : 1,
		__DIR__"npc/shusheng2" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

