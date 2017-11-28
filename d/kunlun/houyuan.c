#include <ansi.h>
#include <room.h>

inherit ROOM;

void create()
{
	set("short", "后院");
        set("long", @long
由于这里一向少有人来，渐渐被人忘记，也就很久没有被
打扫过了。落叶满地，踩上去软绵绵的。墙壁已有些残破，檐
下结满了蜘蛛网，角落里的一扇小门因为日晒雨淋，开始朽烂。
long);
        set("exits",([
                "out" : __DIR__"fufengshan",
                "south" : __DIR__"shanlin2",
	]));

	set("no_clean_up", 0);
	create_door("out", "小门", "enter", DOOR_CLOSED);
	set("outdoors", "kunlun");

	setup();
	replace_program(ROOM);
}
