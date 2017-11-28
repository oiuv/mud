inherit ROOM;

void create()
{
	set("short", "金龙峡");
	set("long", @LONG
金龙峡又称唐峪，是进入恒山的入口。恒山一名太恒山或
称玄岳，是五岳中的北岳，道教以之为「第五小洞天」。它横
亘三百余里，如一队行进中的队列，昔人以为恒山如行来相对
泰山如坐、华山如立、嵩山如卧和衡山如飞。
LONG);
	set("exits", ([
		"southeast" : __DIR__"cuipinggu1",
		"northeast" : "/d/beijing/road6",
	]));
	set("objects", ([
		__DIR__"npc/jing" : 1,
		"/d/motianya/npc/qiaofu" : 1,
	]));
	set("outdoors", "hengshan");
	setup();
        replace_program(ROOM);
}

