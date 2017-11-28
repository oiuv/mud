inherit ROOM;

void create()
{
        set("short", "湖边小路");
        set("long", @LONG
这是圣湖边的小路。路侧长草没足, 青绿可喜。
LONG);
        set("outdoors", "xuedao");
        set("exits", ([
                "north" : __DIR__"shanjiao",
                "south" : __DIR__"hubian3",
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
