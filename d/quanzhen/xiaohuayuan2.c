inherit ROOM;

void create()
{
        set("short", "小花园");
        set("long", @LONG
这里是重阳观里的小花园，种植着一些叫不出名字来的花
木，园角砌着一座假山，假山下是一潭小小的金鱼池，池水清
澈见底，你看见有数条红色的金鱼在里面悠哉游哉地游来游去。
几个道童正在这里嬉戏着。
LONG);
        set("outdoors", "quanzhen");
        set("exits", ([
                "east" : __DIR__"xiaohuayuan3",
                "west" : __DIR__"chanfang3",
                "southwest" : __DIR__"xiaohuayuan1",
        ]));
        set("objects", ([
                __DIR__"npc/daotong" : random(3),
        ]));

        setup();
        replace_program(ROOM);
}
