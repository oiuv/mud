inherit ROOM;

void create()
{
        set("short", "大轮寺");
        set("long", @LONG
这里是大轮寺的山门，门前是络绎不绝的进香朝圣的信徒
而有的甚至来自乌丝藏西南的波丝。山门前站了个手持法器的
葛伦布在维持秩序，东方是一条青石板铺成的山路。
LONG);
        set("outdoors", "xueshan");
        set("exits", ([
                "north"    : __DIR__"guangchang",
                "eastdown" : "/d/xuedao/nroad4",
        ]));
        set("objects", ([
                CLASS_D("xueshan") + "/gelunbu": 1,
                "/d/wudang/npc/guest": 2,
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
        object glb;

        if (dir != "north" ||
            ! objectp(glb = present("ge lunbu", this_object())))
                return ::valid_leave(me, dir);

        return glb->permit_pass(me, dir);
}
