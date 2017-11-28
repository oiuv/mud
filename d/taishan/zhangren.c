// Room: /d/taishan/.c
// Date: CSWORD 96/03/25

inherit ROOM;

void create()
{
	set("short", "丈人峰");
	set("long", @LONG
这里位于玉皇顶以西里许的地方，形状有如一个伛偻的老人。
靠西有黄华洞，因洞路极为危险，后人在进路处写上「回车岩」。
从这里往北走便是岱顶的北天门。
LONG );
	set("exits", ([
		"east" : __DIR__"yuhuang",
		"northup" : __DIR__"beitian",
	]));
	set("objects",([
		__DIR__"npc/wei-shi1" : 2,
	]));
//	set("no_clean_up", 0);
	set("outdoors", "taishan");
	setup();
	replace_program(ROOM);
}

