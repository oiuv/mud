#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "嵩山派客房");
	set("long", @LONG
这是一间很大的客房，是嵩山派供前来祭神的游客暂住的
房间陈设十分简陋。 靠墙放了十几张小木床。 虽然简陋了点
但是总比在荒山中露宿强得多了。
LONG);
	set("sleep_room", 1);
	set("no_fight", 1);
	set("exits", ([
	       "west"  :  __DIR__"changlang",
	]));
	setup();
}


