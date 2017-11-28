// Room: /d/xiangyang/northjie.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "北大街");
	set("long", @LONG
这是一条宽阔的青石街道，向南北两头延伸。北面是玄武
内门，南边显得很繁忙。东边是一茶馆，一面上书“茶”的招
幡在风中轻轻地摇曳着，一股股茶香扑面而来。西面是襄阳城
的北兵营，隐隐能听见里面传来的操练声。
LONG );
        set("outdoors", "xiangyang");
	set("no_clean_up", 0);

	set("exits", ([
		"east"  : __DIR__"chaguan",
		"south" : __DIR__"dingzi",
		"west"  : __DIR__"bingying1",
		"north" : __DIR__"northgate1",
	]));
	setup();
	replace_program(ROOM);
}

