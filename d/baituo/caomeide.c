inherit ROOM;

void create()
{
        set("short", "草莓地");
        set("long", @LONG
这里是白驼山庄后面的一块草莓地，鲜红的草莓散落在绿
草中，让人感到非常美妙惬意。
LONG);
        set("exits", ([
                "northeast" : __DIR__"shulin1",
        ]));

        set("objects" , ([
                __DIR__"obj/caomei" : random(7),
        ]));

        set("outdoors", "baituo");
        setup();
        replace_program(ROOM);
}
