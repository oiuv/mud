inherit ROOM;

void create()
{
        set("short", "村东口");
        set("long", @LONG
这里是小村的东头。因为暴雨刚过，地上一片泥泞，路非常不好
走。顺着这条路一直向东走一两个时辰就可到青石坪了，那里是这附
近最大的镇子。
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "northwest" : __DIR__"cun7",
                "east" : "/d/dali/zhulin2",
        ]));

        setup();
        //replace_program(ROOM);
}
