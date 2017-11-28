//room: mtdating.c

inherit ROOM;

void create()
{
        set("short", "崖顶");
        set("long", @LONG
这就是摩天崖了。上面光秃秃的，连一棵小树也没有，峰顶到也
十分开阔，但身周云雾缭绕，当真是置身云端之中，使人心惊肉跳。
东面有一个小木屋。
LONG );
        set("outdoors", "xiakedao");
        set("exits",([
                "east" : __DIR__"mtxiaowu",
                "down" : __DIR__"mtyadi",
        ]));
        set("objects",([
                __DIR__"npc/xieyan" : 1,
        ]));

        set("outdoors", "motianya");
        setup();
}

int valid_leave(object me, string dir)
{
        object ob;

        if (dir == "east" &&
            objectp(ob = present("xie yanke", this_object())) &&
            living(ob))
                return notify_fail("谢烟客把手一拦，喝道：“给我回来！”\n");

        return ::valid_leave(me, dir);
}
