inherit ROOM;

void create()
{
        set("short", "竹园");
        set("long", @LONG
这里是一个幽静的竹园，高高低低的翠竹把这里装点得别
有情致。西北方是后院，东北方有个兔苑。南边是花园。
LONG);
        set("exits",([
                "northeast" : __DIR__"sheyuan",
                "northwest" : __DIR__"houyuan",
                "south"     : __DIR__"huayuan",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "baituo");
        setup();
        replace_program(ROOM);
}
