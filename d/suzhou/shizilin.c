inherit ROOM;

void create()
{
	set("short", "狮子林");
	set("long", @LONG
你一走进狮子林，便不禁为江南苏州园林的奇妙美景所折
服。狮子林东南多山，西北多水，素有”假山王国“之称。假
山峰峦叠嶂，曲折盘旋，石洞连绵不断，幽深莫测。咫尺之间，
可望而不可及，变幻无穷如入迷宫，不由得不为之赞叹不已。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"east"  : __DIR__"yanyutang",
		"west"  : __DIR__"nandajie1",
		"north" : __DIR__"zhipoxuan",
	]));
	setup();
	replace_program(ROOM);
}

