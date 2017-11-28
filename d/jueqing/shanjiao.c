inherit ROOM;

void create()
{
        set("short", "绝情谷山脚");
        set("long", @LONG
这里是绝情谷山脚下，但见四周溪流飞瀑，树木高耸，两
边山峰壁立，景色极尽清幽。 
LONG);
        set("outdoors", "jueqing");
        set("exits", ([
               "northup"   : __DIR__"shulin1",
               "southdown" : "/d/xiangyang/shanlu1",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
