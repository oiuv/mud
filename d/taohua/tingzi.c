inherit ROOM;

void create()
{
        set("short", "试剑亭");
        set("long", @LONG
这里是一个用白玉石砌成的亭子，亭子砌得小巧玲珑，十
分精巧。亭子的北面是一片桃花林，南面则是桃花山庄的正门。
LONG);
        set("exits", ([
                "south" : __DIR__"damen",
                "north" : __DIR__"tao_out",
        ]));
        set("outdoors", "taohua");
        setup();
        replace_program(ROOM);
}
