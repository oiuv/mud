#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "树洞内部");
	set("long", @LONG
这是杨州城中央广场的老榕树内部，也是丐帮秘密的地下
通道的总交汇处。树洞里丢满了各种垃圾，弭漫着一股臭哄哄
的味道。树洞壁上钉着一块非常醒目的木牌。
LONG);
	set("exits", ([
		"out"  : "/d/city/guangchang",
		"down" : __DIR__"undertre",
	]));
	set("objects", ([
                "/d/gaibang/npc/2dai" : 1 + random(2),
                "/d/gaibang/npc/1dai" : 1 + random(2),
		CLASS_D("gaibang") + "/li" : 1,
	]));
	setup();
}

int valid_leave(object me, string dir)
{
        object guard;

        if (dir != "down"
           || ! objectp(guard = present("li sheng", this_object())))
                return ::valid_leave(me, dir);

        return guard->permit_pass(me, dir);
}
