inherit ROOM;

void create()
{
        set("short", "储藏室");
        set("long", @LONG
这里是绝情谷的储藏室，里面堆放着一些杂物。
LONG);
        set("exits", ([
               "west"   : __DIR__"houtang",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

