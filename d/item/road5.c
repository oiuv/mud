// road5.c 小径

inherit ROOM;

void create()
{
//      object ob;

	set("short", "小径");
	set("long", @LONG
这是一条蜿蜒的小径，曲曲折折通往山里。路旁有一间小砖房，烟筒
里面时不时冒出一股股黑烟，闻起来有些难受，你一时忍不住想打两个喷
嚏。屋里面传来阵阵的敲打声音，看来这里是给村民们打造菜刀、犁头的
铁匠铺。
LONG );

	set("exits", ([
                "west"  : __DIR__"road4",
                "enter" : __DIR__"xiaowu",
	]));
	set("outdoors", "suzhou");
	setup();
        replace_program(ROOM);
}