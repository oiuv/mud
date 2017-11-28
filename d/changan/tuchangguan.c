//Room: tuchangguan.c

inherit ROOM;

void create()
{
        set("short", "土娼馆");
        set("long", @LONG
还没想好呢!呵呵!
LONG);
        set("exits", ([ /* sizeof() == 1 */
        	"south" : __DIR__"huarui6",
        ]));
        set("objects", ([
        	__DIR__"npc/jinu" : 1,
        ]) );

	setup();
        replace_program(ROOM);
}
