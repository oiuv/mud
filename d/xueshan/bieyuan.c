inherit ROOM;

void create()
{
        set("short", "雪山别院");
        set("long", @LONG
这里是大轮寺的分部，当年贡唐仓大喇嘛不远万里进京面
圣，被封为国师，就在此处宣扬佛法。
LONG);
        set("exits", ([
                "east" : "/d/beijing/road5",
        ]));
        set("objects" , ([
                __DIR__"npc/seng-bing1" : 4,
                __DIR__"npc/zhike" : 1,
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
        if (me->query("id") == "seng bing"
           && dir == "east")
                return 0;

        return ::valid_leave(me, dir);
}
