inherit ROOM;

void create()
{
        set("short", "戈壁");
        set("long", @LONG
这里是临近沙漠的戈壁滩，荒无人烟。东边是一望无际的
大沙漠，西北方可以看见一座小镇。
LONG);
        set("outdoors", "baituo");
        set("no_clean_up", 0);
        set("exits", ([
                "east" : "/d/xingxiu/shamo10",
                "west" : __DIR__"dongjie",
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
