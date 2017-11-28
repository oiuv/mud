inherit ROOM;

void create()
{
	set("short", "青石官道");
	set("long", @LONG
你走在一条青石大道上，人来人往非常繁忙，不时地有人
骑着马匆匆而过。大道两旁有一些小货摊，似乎是一处集市。
东面就是苏州城了。西北方通向寒山寺。
LONG );
	set("outdoors", "suzhou");
	set("exits", ([
		"north" : __DIR__"hanshansi",
		"east"  : __DIR__"road3",
		"west"  : "/d/zhongzhou/dongmeng",
	]));
	setup();
}
