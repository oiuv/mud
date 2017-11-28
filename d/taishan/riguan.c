// Room: /d/taishan/.c
// Date: CSWORD 96/03/25

inherit ROOM;

void create()
{
	set("short", "日观峰");
	set("long", @LONG
这里是位于南天门西面的山岭，怪石攒簇，最高的地方一石
卓立，名为君子峰。往北走便是泰山的西天门。
LONG );
	set("exits", ([
		"westup" : __DIR__"yuhuang",
		"eastup" : __DIR__"tanhai",
	]));
	set("objects", ([
		__DIR__"npc/tianmen" : 1,
	]));
//	set("outdoors", "taishan");
	set("no_clean_up", 0);
	setup();
	"/clone/board/taishan_b"->foo();
}

