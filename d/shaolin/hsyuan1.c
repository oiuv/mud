// Room: /d/shaolin/hsyuan1.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "和尚院一部");
	set("long", @LONG
这里是和尚院待客的地方，靠墙左右两侧摆着一溜太师椅。
墙角一几，放着几个茶壶。有个茶壶壶身上题了“碧螺春”三
个篆字，壶嘴热气腾腾，似乎是刚沏的新茶。一位小沙弥在一
边垂手站立。
LONG );
	set("exits", ([
		"west" : __DIR__"wuchang3",
		"east" : __DIR__"zhulin1",
		"south" : __DIR__"zoulang7",
		"north" : __DIR__"hsyuan2",
	]));
	set("objects",([
		CLASS_D("shaolin") + "/hui-he" : 1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

