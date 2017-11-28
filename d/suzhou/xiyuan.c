inherit ROOM;

void create()
{
	set("short","戏园子");
	set("long",@LONG
这是一座苏州城里鼎鼎有名的戏园，戏园中的生，旦，净，
墨，丑一应具全，场中一个大戏台，台上正在唱着《遇长春》，
台下不时地传来票友们的叫跃，喝彩声。你也忍不住想坐下来
看看戏，放松一下筋骨。
LONG);
	set("objects", ([
		__DIR__"npc/piaoyou": 3,
	]));
	set("exits", ([
		"east" : __DIR__"beidajie1",
	]));
	setup();
	replace_program(ROOM);
}
