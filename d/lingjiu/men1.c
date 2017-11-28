inherit ROOM;

void create()
{
        set("short", "囚室大门");
        set("long", @LONG
这是缥缈峰灵鹫宫关押犯人的地方，这是囚室东边，西面
便是囚室。
LONG);
        set("exits", ([
		"west" : __DIR__"qiushi",
		"east" : __DIR__"changl11",
        ]));
	setup();
        replace_program(ROOM);
}
