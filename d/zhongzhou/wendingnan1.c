inherit ROOM;

void create()
{
        set("short", "文定南街");
        set("long", @LONG
这是中州文定南街，宽敞的街道看的人不竟心情一畅。街
道的东面熙熙攘攘的是一个菜场。西面的一家店面，一听里面
的算盘声就知道是一家不小的钱庄。
LONG);
	set("outdoors", "zhongzhou");

        set("exits", ([
                "east" : __DIR__"canchang",
                "south" : __DIR__"wendingnan2",
                "west" : __DIR__"bank",
                "north" : __DIR__"shizhongxin",
        ]));
        set("objects", ([
                "/d/beijing/npc/liumang" : 1,
        ]));

        setup();
        replace_program(ROOM);
}

