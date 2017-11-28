#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "粮仓大门");
	set("long", @LONG
你正站在荆州粮仓的门口，可以看到两个穿着制服的官兵
正在此地巡逻，不时地传来呐喊声。老百姓是不允许在此观看
的，你最好赶快走开。
LONG);
	set("exits", ([
		"west" : __DIR__"nandajie2",
		"east" : __DIR__"liangcang",
	]));
	set("objects", ([
		"/d/city/npc/bing" : 2,
	]));

	setup();
}

int valid_leave(object me, string dir)
{
        if (dir == "east" &&
           objectp(present("guan bing", environment(me))))
                return notify_fail(CYN "官兵一把拦住你，骂道：粮仓重地，岂是你们这些"
                                   "泥腿子随便来得的？\n" NOR);                
        return ::valid_leave(me, dir);
}
