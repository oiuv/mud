// Room: /d/taishan/.c
// Date: CSWORD 96/03/25

inherit ROOM;

void create()
{
	set("short", "二天门");
	set("long", @LONG
这里又叫「中天门」。一般的登山者来到这里都已累极，但是
这里才是泰山的一半啊！面对前面险峻的十八盘，很多人都不禁犹
豫起来。
LONG );
	set("exits", ([
		"northup" : __DIR__"wudafu",
		"southdown" : __DIR__"huima",
	]));
	set("objects",([
		__DIR__"npc/tiao-fu" : 1,
		__DIR__"npc/tiansong" : 1,
		__DIR__"npc/tianbai" : 1,
	]));
//	set("no_clean_up", 0);
	set("outdoors", "taishan");
	setup();
	replace_program(ROOM);
}

