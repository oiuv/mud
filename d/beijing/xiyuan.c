inherit ROOM;

void create()
{
	set("short", "长安戏院");
	set("long", @LONG
这里就是京城里著名的长安戏院，是京城百姓休息和娱乐的佳所。戏台上
面几个戏子正在唱戏。台下黑压压的一片都是人。唱到妙处，台下的观众们禁
不住大声喝采。北边一条小道通往戏院的后台。
LONG );
	set("exits", ([
		"north" : __DIR__"xiyuanup",
		"west"   : __DIR__"wang_10",
	]));
	set("objects", ([
		__DIR__"npc/guanzhong" : 3,
		__DIR__"npc/xianren" : 1,
		__DIR__"npc/jumin1" : 1,
	]));

	setup();
	replace_program(ROOM);
}

