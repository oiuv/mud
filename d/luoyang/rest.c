inherit ROOM;

void create()
{
	set("short", "休息室");
	set("long", @LONG
房间里除了几个凳子椅子，没有摆设任何东西，但也不提供任何服务，
这里是茶楼老板特地为那些来来往往于大街上的游客准备的，供他们休息
之用，不收取任何费用，可见老板的心地善良。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"east" : __DIR__"chalou",
	]));
        set("objects", ([
                "/d/beijing/npc/kid1" : 1,
                "/d/beijing/npc/old2" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
