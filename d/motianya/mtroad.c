// mtroad.c  山路

inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
这是一条山路，两旁是茂盛的森林，有一个女孩在这眼望南边发
呆，南边就是摩天崖了，一股阴森恐怖的气氛随之而来，你不禁告诉
自己，还是快走吧。
LONG );
        set("outdoors", "motianya");
        set("exits", ([
            "south" : __DIR__"mtyadi",
            "east"  : __DIR__"mtroad1",
        ]));
        set("objects",([
            __DIR__"npc/dingdang" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
