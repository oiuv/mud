// Room: /d/shaolin/twdian.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "天王殿");
	set("long", @LONG
这里是少林寺的中殿天王殿。殿内香烟燎绕，幔角叮咚。
香火比前殿要旺盛的多。正前方供着个大肚子，似乎永远都笑
咪咪的弥勒佛。四大天王分列两旁，分执“风调雨顺”。两侧
香桌上摆满了四季果蔬，弥勒的身后站立的是韦驮。只见他金
盔金甲，年轻英俊，威风凛凛，双手合十，金刚杵横放腕上。
左右两边各有一间偏殿。
LONG );
	set("exits", ([
		"east" : __DIR__"twdian1",
		"west" : __DIR__"twdian2",
		"southdown" : __DIR__"taijie",
		"north" : __DIR__"guangchang2",
	]));
	set("objects",([
		CLASS_D("shaolin") + "/dao-guo" : 1,
		__DIR__"npc/xiang-ke" : 1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

