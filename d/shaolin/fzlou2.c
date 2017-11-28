// Room: /d/shaolin/fzlou2.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "方丈室");
	set("long", @LONG
方丈室陈设简洁，正中一几，一蒲团，一矮床。北面墙上写
着大大的一个『禅』字。一位慈眉善目的灰衣老僧正端坐于蒲团
上打坐。
LONG );
	set("exits", ([
		"south" : __DIR__"fzlou1",
	]));
	set("objects",([
		CLASS_D("shaolin") + "/xuan-ci" : 1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

