// Room: /lingzhou/mingshazhou.c
// Java Sep.23 1998

#include <room.h>

inherit ROOM;

void create()
{
	set("short", "鸣沙洲");
	set("long", @LONG
鸣沙洲就在青铜峡的上游，附近就是连天的沙丘，这里正好处在
风口，强劲的西北风吹的黄沙漫天横飞、嗡嗡作响，鸣沙洲由此得名，
一走到这里你就觉得透体冰凉，飞沙打在你脸上生疼生疼，让你睁不
开眼睛。
LONG	);
	set("exits", ([
		"northeast" : __DIR__"qingtongxia",
		"southwest" : __DIR__"xuanhebao",
	]));
	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

