// wuchang.c

inherit ROOM;

void create()
{
	set("short", "练武场");
	set("long", @LONG
这是一个宽大的练武场，有几个手执短剑的少年少女在这里练功。
旁边站着几人，有男有女，年纪轻的只有二三十岁，老的已有六七十
岁，身上却不带兵刃。东边、南边是一片更大的练武场，北边则通向
一条走廊。
LONG );
	set("exits", ([
		"north" : __DIR__"zoulang",
                "south" : __DIR__"wuchang2",
		"east"  : __DIR__"wuchang3",
	]));
        set("for_family", "神龙教");
        setup();
	replace_program(ROOM);
}
