// road2.c 小径

inherit ROOM;

void create()
{
//      object ob;

	set("short", "小径");
	set("long", @LONG
这是一条蜿蜒的小径，曲曲折折通往山里。路面上光滑平实，看来是
经常有人来往。四周非常安静，道旁都是田园村户。
LONG );

	set("exits", ([
                "westdown" : __DIR__"road1",
                "eastdown" : __DIR__"road3",
	]));
	set("outdoors", "suzhou");
	setup();
        replace_program(ROOM);
}