inherit ROOM;

void create()
{
        set("short", "云杉林");
        set("long", @long
这里是一片蜿蜒无尽的翠绿的树林，密密的云杉像撑天的
巨伞，重重叠叠的枝丫，只漏下斑斑点点细碎的日影。林子里
十分幽静，连鸟雀也少飞来，只偶尔能听到远处的几声鸟鸣。
long);
	set("exits", ([
		"west"  : __DIR__"shanlin" + (random(5) + 1),
		"east"  : __DIR__"kuhanlou1",
		"north" : __DIR__"shanlin" + (random(5) + 1),
		"south" : __DIR__"shanlin" + (random(5) + 1),
	]));

	set("outdoors", "kunlun");
	replace_program(ROOM);
}
