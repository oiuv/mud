// Room: /d/suzhou/zhengdian.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "正殿");
	set("long", @LONG
一走进正殿，首先你看到的是号称扬州八怪的画家罗聘所
绘寒山，拾得写意画像石刻和郑文焯指画丰干和尚石刻像。左
右碑廊中藏历历代名人岳飞等题写得诗文，楹联碑刻树方，世
传精品。正殿左右的偏殿保存着宋代樟木雕塑的金身五百罗汉。
LONG );
	set("no_clean_up", 0);
	set("exits", ([
		"out"   : __DIR__"hanshansi",
		"east"  : __DIR__"hanshidian",
	]));
	setup();
	replace_program(ROOM);
}

