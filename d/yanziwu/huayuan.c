//room: huayuan.c
inherit ROOM;

void create()
{
        set("short","花园");
        set("long",@LONG
这个花园虽然不大，但整理的井井有条，看的出主人下了
一番功夫，丫环常来这里嬉戏。沿着弯弯曲曲的花径，可以同
向各处。
LONG );
        set("outdoors", "yanziwu");
        set("exits",([
            "north" : __DIR__"changlang",
            "south" : __DIR__"jiashan",
            "west"  : __DIR__"dannuo",
            "east"  : __DIR__"biheqiao",
        ]));
        set("objects",([
            __DIR__"npc/yahuan" : 2,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

