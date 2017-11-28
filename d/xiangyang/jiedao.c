// Room: /d/xiangyang/jiedao.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "街道");
	set("long", @LONG
这里是襄阳城内有钱人的居住区。街道两旁是一些豪华的
住宅，虽然襄阳历经战乱，但还有许多有钱人没搬走，为坚守
襄阳城出钱出力。
LONG );
        set("outdoors", "xiangyang");

	set("exits", ([
		"east"  : __DIR__"minju1",
		"west"  : __DIR__"minju2",
		"north" : __DIR__"eastjie2",
	]));
	set("objects", ([
		__DIR__"npc/poorman" : 2,
	]));
	setup();
	replace_program(ROOM);
}

