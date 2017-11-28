// Room: /d/quanzhou/jiaxinggang.c
// Date: May 7, 96   Jay

inherit ROOM;

void create()
{
	set("short", "嘉兴海港");
	set("long", @LONG
这里是嘉兴海港，港内白帆点点，码头上停着好多渔船，可是
一提起桃花岛却个个摇头。
LONG );
	set("exits", ([
                "west" : __DIR__"nanhu",
	]));
	set("objects", ([
		"/d/taohua/npc/chuanfu": 1,
	]));
	set("no_clean_up", 0);
	set("outdoors", "quanzhou");
	setup();
	replace_program(ROOM);
}

