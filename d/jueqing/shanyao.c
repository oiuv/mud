inherit ROOM;

void create()
{
        set("short", "山腰");
        set("long", @LONG
此处阳光照耀，地气和暖，情花开放得早，这时已结了果
实。但见果子或青或红，有的青红相杂，还生著茸茸细毛。翘
首远望，但见绝情峰上云雾缭绕，壮观之极。
LONG);
        set("outdoors", "jueqing");
        set("exits", ([
               "west"      : __DIR__"shanlu1",
               "eastup"    : __DIR__"qinghuaao",
        ]));

        set("objects", ([
                __DIR__"npc/dizi2" : 2,
        ]));  

        set("no_clean_up", 0);

        setup();
}

int valid_leave(object me, string dir)
{
        object guard;

        if (dir != "eastup"
           || ! objectp(guard = present("lvshan shaonv", this_object())))
                return ::valid_leave(me, dir);

        return guard->permit_pass(me, dir);
}
