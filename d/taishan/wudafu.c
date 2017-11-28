// Room: /d/taishan/.c
// Date: CSWORD 96/03/25

inherit ROOM;

void create()
{
	set("short", "五大夫松");
	set("long", @LONG
相传当年秦始皇上泰山，来到这里下起雨来，他就到两棵松树
底下避雨，结果没淋着。因此，他就封这两棵松树为「五大夫」。
后来不知从哪里来了一块巨大的飞来石把两棵松树砸死了。后人再
在旁补种五株松树。在不远处还有一个御帐坪，据说就是秦始皇当
年结帐的位置。从这里再往山上走便会到达十八盘的入口。
LONG );
	set("exits", ([
		"northup" : __DIR__"longmen",
		"southdown" : __DIR__"ertian",
	]));
	set("no_clean_up", 0);
	set("outdoors", "taishan");
	setup();
	replace_program(ROOM);
}

