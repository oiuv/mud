inherit ROOM;

void create()
{
	set("short", "武德道");
	set("long", @LONG
这是一条略窄的青石板街道，向东西两头延伸。在往东就是洛阳的中
心广场了。居住在这条街上的大都是一些武林人士，因此习武之风而极胜，
到处可见练武之人，武馆，武场，镖局也比比皆是，为了安全，官府在这
里布置了官兵。北边是高丽商人的住所——新罗坊，向南是赫赫有名的四
海钱庄。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
		  "east" : __DIR__"center",
		  "north" : __DIR__"xinluofang",
		  "south" : __DIR__"huqing",
		  "west" : __DIR__"wroad2",
	]));
        set("objects", ([
                "/clone/npc/xunbu" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
