// wuchang2.c

inherit ROOM;

void create()
{
	set("short", "练武场");
	set("long", @LONG
这是一个比北面更为宽大的练武场，许多手执短剑的少年少女在
这里练功。不同于北面的是这里的老者很少，几乎都是一些年轻人在
练习武功。有一些则在窃窃私语，不知道在干些什么。一直向北走穿
越整个练功场就到走廊了。
LONG );
	set("exits", ([
		"north" : __DIR__"wuchang",
	]));
        set("for_family", "神龙教");
        setup();
	replace_program(ROOM);
}
