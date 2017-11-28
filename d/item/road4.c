// road4.c 小径

inherit ROOM;

void create()
{
//      object ob;

	set("short", "小径");
	set("long", @LONG
这是一条蜿蜒的小径，曲曲折折通往山里。路面上光滑平实，看来是
经常有人来往。这里已经是山脚了，山坡上有一些梯田，附近间或有一些
茅屋。只有东边不远的地方有一见小砖房，烟筒里面时不时冒出一股股黑
烟，不象是炊火。
LONG );

	set("exits", ([
                "southwest" : __DIR__"road3",
                "east"      : __DIR__"road5",
	]));
	set("outdoors", "suzhou");
	setup();
        replace_program(ROOM);
}
