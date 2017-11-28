inherit ROOM;

void create()
{
        set("short", "御书楼");
        set("long", @LONG
御书楼为南岳庙历代藏书之处，天子御赐，贤达乐捐，这
里早已洋洋大观。
LONG);
        set("exits", ([
               "south"  : __DIR__"jiayingmen",
               "north"  : __DIR__"dadian",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

