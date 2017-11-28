inherit ROOM;

void create()
{
        set("short", "林间小径");
        set("long", @LONG
你走在一条小径上，两旁种满了竹子，修篁森森，绿荫满
地，除了竹叶声和鸟鸣声，听不到别的动静。
LONG );
        set("exits", ([
                "south" : __DIR__"xiaolu2",
                "north" : __DIR__"houyuan",
        ]));
        set("outdoors", "wudang");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
