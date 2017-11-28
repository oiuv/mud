inherit ROOM;

void create()
{
	set("short", "密道");
	set("long", @LONG
这是雪山寺的僧人为了方便往来中原，特地设置了的密道
以便神不知鬼不觉的往来西域。
LONG);

        set("exits", ([
                "east" : __DIR__"xsmidao",
                "west" : __DIR__"xsmidao2",
        ]));

	setup();
        replace_program(ROOM);
}
