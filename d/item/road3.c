// road3.c 小径

inherit ROOM;

void create()
{
//      object ob;

	set("short", "小径");
	set("long", @LONG
这是一条蜿蜒的小径，曲曲折折通往山里。路面上光滑平实，看来是
经常有人来往。四周非常安静，道旁都是田园村户。有时可以听见几声清
脆动人的鸟叫。
LONG );

	set("exits", ([
                "westup"    : __DIR__"road2",
                "northeast" : __DIR__"road4",
	]));
	set("outdoors", "suzhou");
	setup();
        replace_program(ROOM);
}