#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "东练武场");
	set("long", @LONG
这是露天练武场，好多人在这里辛苦的练着，你走在场中
没有人回头看你一眼，都在聚精汇神的练着自己的功夫。
LONG);
        set("no_fight", 1);
        set("can_dazuo", 1);
	set("exits", ([
	       "north" : __DIR__"guofu_wuchang4",
	       "west" : __DIR__"guofu_lang2",
        ]));
	setup();
}
