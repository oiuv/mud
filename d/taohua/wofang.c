inherit ROOM;

void create()
{
        set("short", "卧房");
        set("long", @LONG
你走进了一间卧房。一股若有若无的甜香扑鼻而来。琴剑
书画，挂在墙上。锦笼纱罩，金彩珠光。小几上汝窑美人瓶内
的桃花正自盛开。右首一张床，床头放着五彩鸾纹被。
LONG);
        set("exits", ([
                "east" :__DIR__"dating",
        ]));
        set("objects", ([
                __DIR__"npc/binu" : 2,
        ]));
        setup();
        replace_program(ROOM);
}
