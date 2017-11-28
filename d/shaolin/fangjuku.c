// Room: /d/shaolin/fangjuku.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "防具库");
	set("long", @LONG
这是一间很大的房间，靠墙整齐地放着一个个大柜子，不少
柜子门敞开着，露出里面的各种防具，品种之多，是你生平仅见。
一位灰衣僧人正埋头整理一堆破损的护具。连你进来也没有注意。
LONG );
	set("exits", ([
		"north" : __DIR__"yaopinku",
		"south" : __DIR__"wuqiku",
	]));
	set("objects",([
		CLASS_D("shaolin") + "/dao-xiang" : 1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

