inherit ROOM;

void create()
{
	set("short", "开封贡院");
	set("long", @LONG
过了州桥，街道边一处高深的大院，威武的石狮守卫两边
门楣上『贡院』两字作深红色，每月上旬，此处将进行举人的
开考，门边墙上贴了张告示。
LONG);
	set("objects", ([
  		__DIR__"npc/zhukao3" : 1,
	]));
        set("no_clean_up", 0);
	set("exits", ([
  		"east" : __DIR__"road2",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
