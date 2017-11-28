inherit ROOM;

void create()
{
        set("short", "小木屋");
        set("long", @LONG
这是一间不是很大的木头屋子，这里看起来象个药室，室
中摆放着各种不同的配药的用具和一些已经配好了的药。
LONG);
	set("exits", ([
		"south" : __DIR__"xiaodao3",
	]));
	set("objects", ([
		CLASS_D("xiaoyao") + "/xuemuh" : 1,
	]));
	setup();
	replace_program(ROOM);
}
