// Room: /d/shaolin/yaopinku.c
// Date: YZC 96/01/19

#include <room.h>
inherit ROOM;

void create()
{
	set("short", "药品库");
	set("long", @LONG
这里是全寺僧侣领用药品的地方。房间里弭漫着股浓浓
的药味。靠墙是一排排高及房顶的药柜，每个药柜都由上百
个装药的小抽屉，上面贴满了密密麻麻的各种草头药名。东
首墙边放着个巨大的暗红色杉木药柜，上面贴着个盖有方丈
印签的大封条。一位中年僧人正来回忙碌着称量药品，熬药
煎汤。
LONG );
	set("exits", ([
		"south" : __DIR__"fangjuku",
	]));
	set("objects",([
		CLASS_D("shaolin") + "/dao-xiang2" : 1,
	]));
	setup();
	replace_program(ROOM);
}

