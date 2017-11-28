inherit ROOM;

void create()
{
	set("short", "戏院后台");
	set("long", @LONG
这里是长安戏院的后台，后台不大，却打扫得很干净。几个戏子正在后台
化妆，看见你来了，都用很奇怪的眼神盯着你。
LONG );
	set("exits", ([
		"south" : __DIR__"xiyuan",
	]));
	set("objects", ([
		__DIR__"npc/xizi1" : 2,
		__DIR__"npc/xizi2" : 1,
		__DIR__"npc/xizi3" : 1,
	]));

	setup();
	replace_program(ROOM);
}

