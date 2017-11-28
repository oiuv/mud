inherit ROOM;

void create()
{
        set("short", "长廊");
        set("long", @LONG
这是连接大厅和书房的长廊，虽不见花木，但也能闻到淡
淡的花香。
LONG);
        set("exits", ([
               "east" : __DIR__"dating",
               "west" : __DIR__"shufang",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
