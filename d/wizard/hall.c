
#include <room.h>
#include <ansi.h>

inherit ROOM;

void create()
{
	set("short", HIC "服务大厅" NOR);
	set("long", @LONG
这里是英雄圣殿的服务大厅，有关英雄圣殿的任何事情
都可以在这里了解到。
LONG);                

	set("exits", ([
             "out"   :  __DIR__"herodoor",
             "west"  :  __DIR__"noname_room",
             "east"  :  __DIR__"guest_room",
             //"north" :  "/u/ivy/d/mail_center/mailcenter"
        ]));

	set("no_fight", 1);

	setup();
}