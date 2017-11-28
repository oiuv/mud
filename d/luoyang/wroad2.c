inherit ROOM;

void create()
{
	set("short", "武德道");
	set("long", @LONG
这是一条略窄的青石板街道，向东西两头延伸。居住在这条街上的大
都是一些武林人士，因此习武之风极胜，到处可见练武之人，武馆，武场，
镖局也比比皆是，为了安全，官府在这里布置了官兵。北边是文人墨客常
来拜祭的孔庙，南面是一些初入江湖的人常来龙腾武馆。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
		"east" : __DIR__"wroad1",
  		"north" : __DIR__"kongmiao",
  		"south" : __DIR__"wuguan",
  		"west" : __DIR__"wroad3",
	]));
        set("objects", ([
                "/d/beijing/npc/boy3" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
