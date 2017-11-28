// road1.c 小径

inherit ROOM;

void create()
{
//      object ob;

	set("short", "小径");
	set("long", @LONG
这是一条蜿蜒的小径，曲曲折折通往山里。路面上光滑平实，看来是
经常有人来往。东面隐隐约约可以看到青石铺就的官道。
LONG );

	set("exits", ([
                "west"   : "/d/suzhou/road5",
                "eastup" : __DIR__"road2",
	]));

        set("objects", ([
                __DIR__"npc/zhang" : 1,
        ]));

	set("outdoors", "suzhou");
	setup();
        replace_program(ROOM);
}