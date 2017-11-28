#include <room.h>
inherit ROOM;

void create()
{
	set("short", "西单");
	set("long", @LONG
这里就是西单，西单也是京城里的繁华地段。人来人往，十分热闹。游人
虽然多，但大都只四处晃悠，着东瞅瞅西看看，也不急着买什么。从右边飘来
一阵浓浓的药材气味，那里就是著名的“回春堂”药铺了。不断有人从北边走
来，似乎那里也挺热闹。南边则是京城里的西长安大街。
LONG );
       set("exits", ([
		"east" : __DIR__"huichuntang",
		"west" : __DIR__"xi_1",
		"north" : __DIR__"bei_2",
		"south" : __DIR__"caroad_w2",
	]));
	set("objects", ([
		__DIR__"npc/boy3" : 1,
		__DIR__"npc/xiaofan" : 1,
		__DIR__"npc/girl2" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

