#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", HIR "【酆都城门】" NOR);
       set("long", HIR @LONG

                    酆     都     城     门

    你现在来到一座黑色的城楼之前，城楼上雕刻著「酆都城」三个大
字。往南不远处有一座石桥，桥上鬼影幢幢，但是却听不到半点声音，
往北走进城楼只见一片黑漆漆的，只有少许暗红色的火光若隐若现地闪
烁著。


LONG NOR );
	set("exits", ([
		"north" : __DIR__"road1",
		"south" : __DIR__"gate",
	]));
	set("objects", ([
		__DIR__"npc/hei": 1,
	]) );

	set("no_fight", 1);
	set("no_sleep_room", 1);

	setup();
}

int valid_leave(object me, string dir)
{
	if( wizardp(me) || !userp(me) ) return 1;

	if (dir == "south") {
		return notify_fail(HIW "\n一个空洞的声音在你耳边响起……没有回头路了……\n" NOR);
	}
	else return 1;
}

