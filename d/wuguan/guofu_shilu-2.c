inherit ROOM;

void create()
{
        set("short", "石板路");
        set("long", @LONG
你走在一条石板路上，北面和南面都是习武堂，不少人在
这里进进出出的，东面是郭府的客厅。
LONG);
        set("no_fight", 1);
        set("exits", ([
               "east" : __DIR__"guofu_dating",
               "west" : __DIR__"guofu_shilu-4",
               "north" : __DIR__"guofu_xiwutang",
               "south" : __DIR__"guofu_xiwutang2",
        ]));
        set("outdoors", "wuguan");
        setup();
        replace_program(ROOM);
}
