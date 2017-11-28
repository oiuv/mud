inherit ROOM;

void create()
{
	set("short", "武德道");
	set("long", @LONG
这是一条略窄的青石板街道，向东西两头延伸。居住在这条街上的大
都是一些武林人士，因此习武之风极胜，到处可见练武之人，武馆，武场，
镖局也比比皆是，为了安全，官府在这里布置了官兵。北边是官府放置的
巡捕房和牢房，西南方向居住着当时威震武林金刀王家，王家乃是洛阳的
大户人家，在武林中又声名显赫，因此门前总是有许多武林人士等候拜访。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"wroad2",
  		"south" : __DIR__"wang",
  		"north" : __DIR__"xunbu",
  		"west" : __DIR__"wroad4",
	]));

        set("objects", ([
                "/d/city/npc/liumang" : 2,
                "/d/city/npc/liumangtou" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
