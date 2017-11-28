inherit ROOM;

void create()
{
	set("short", "福州屏山");
	set("long", @LONG
屏山古称越王山，横亘福州城北，山下华林寺，构法考
究。屏山上俯瞰榕城，历历如画。
LONG );
	set("exits", ([
                "southdown" : __DIR__"beidajie",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

