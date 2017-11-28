#include <room.h>
inherit ROOM;

void create()
{
	set("short", "西单");
	set("long", @LONG
这里就是西单，西单也是京城里的繁华地段。人来人往，十分热闹。从南
边扬起了一阵阵马蹄声，那是京城的长安大街。西方是一个鸟市，那是专门为
江州城里的公子哥儿开设的。北边不远就是西单北大街了。
LONG );
       set("exits", ([
		"east" : __DIR__"xi_2",
		"west" : __DIR__"niaoshi",
		"north" : __DIR__"bei_1",
		"south" : __DIR__"caroad_w1",
	]));
	set("objects", ([
		__DIR__"npc/boy1" : 1,
		__DIR__"npc/tiaofu" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

