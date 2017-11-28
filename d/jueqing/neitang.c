inherit ROOM;

void create()
{
        set("short", "内堂");
        set("long", @LONG
绝情谷内堂较大厅要宽敞一些，四周陈设甚多，但四周仍
摆放着几盆花木，清香四溢。可见谷主是个爱花之人。
LONG);
        set("exits", ([
               "south"  : __DIR__"dating",
               "north"  : __DIR__"changlang2",
               "west"   : __DIR__"chufang",
               "east"   : __DIR__"pianting",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

