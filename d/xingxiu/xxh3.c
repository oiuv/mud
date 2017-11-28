inherit ROOM;

void create()
{
        set("short", "星宿海");
        set("long", @LONG
这里是星宿海边。说是海，其实是片湖泊和沼泽，地形十
分险恶。这里通向星宿海的深处。
LONG );
        set("objects", ([
                CLASS_D("xingxiu") + "/tianlang" : 1,
        ]));
        set("exits", ([
             "southwest" : __DIR__"xxh2",
             "northwest" : __DIR__"xxh5",
        ]));
        set("outdoors", "xingxiu");
        setup();
        replace_program(ROOM);
}


