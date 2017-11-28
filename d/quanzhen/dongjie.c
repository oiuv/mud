inherit ROOM;

void create()
{
        set("short", "东街");
        set("long", @LONG
这里是武功镇的东街，往东走就是武功东门了。武功镇是
小城镇，不算繁华，街上的行人也很稀少。北面是家客栈，客
栈门口挂着半副「鸡鸣早看天」的对联，但是上联已经被撕掉
了。南面是一座大宅院，朱红大门上布满铜钉。从这里往西走
就是武功镇的中心了。
LONG);
        set("outdoors", "wugong");
        set("exits", ([
                "east" : __DIR__"dongmen",
                "west" : __DIR__"zhongxin",
                "north" : __DIR__"kedian1",
                "south" : __DIR__"fu-damen",
        ]));
        set("objects", ([
                __DIR__"npc/seller" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
