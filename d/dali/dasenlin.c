inherit ROOM;
void create()
{
	set("short","大森林");
	set("long",@LONG
此去向北通过茂密的森林可以到达云南昆明，这里已经林
木茂密人迹罕至了，南面不远便是著名的滇池了。
LONG);
	set("outdoors", "kunming");
	set("exits", ([
	    "south" : __DIR__"dianchi",
	    "north" : __DIR__"heisenlin",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

