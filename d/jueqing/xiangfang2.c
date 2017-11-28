inherit ROOM;

void create()
{
        set("short", "厢房");
        set("long", @LONG
这是绝情谷主之女公孙绿萼的闺房，靠窗一边是个精致的
梳妆柜，上面放着一面古铜镜和一些胭脂水粉。
LONG);
        set("exits", ([
               "west"    : __DIR__"changlang3",
        ]));

        set("objects", ([
                __DIR__"npc/lve" : 1,
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
