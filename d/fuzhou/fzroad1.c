inherit ROOM;

void create()
{
	set("short", "仙霞岭");
	set("long", @LONG
这里就是闽浙分水的仙霞岭。向阳的坡面郁郁葱葱，长满
了长长的马尾松。沿途的山路十分难行，来往的口音也渐渐带
有闽音，越来越难以辩识了。
LONG);
	set("exits", ([
                "northdown" : "/d/quanzhou/qzroad4",
                "south"     : __DIR__"erbapu",
	]));
        set("objects", ([
                "/clone/quarry/tu" : 2,
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

