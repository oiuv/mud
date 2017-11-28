// Room: /d/taishan/taishanjiao.c
// Date: CSWORD 96/03/25

inherit ROOM;

void create()
{
	set("short", "泰山脚下");
	set("long", @LONG
泰山古称岱山，为五岳的东岳，为道教第二小洞天，向有 "五岳独
尊" 之称誉，以 "泰山天下雄" 名闻域内。往北就到岱宗坊了。
LONG );
	set("exits", ([
		"north" : __DIR__"daizong",
		"south" : __DIR__"yidao3",
                "east"  : __DIR__"kedian",
	]));
	set("no_clean_up", 0);
	set("outdoors", "taishan");
	setup();
	replace_program(ROOM);
}

