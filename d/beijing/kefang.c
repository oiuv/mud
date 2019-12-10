inherit ROOM;

void create()
{
    set("short", "东客房");
    set("long", @LONG
这里是客店的东客房，布置很简单，房间里发生过打斗，地上斑斑点点都
是血迹。
LONG );
    set("exits", ([
        "west" : __DIR__"kediandayuan",
    ]));
    set("objects", ([
        __DIR__"npc/dubi" : 1,
        __DIR__"npc/lama" : 6,
    ]));
    setup();
    replace_program(ROOM);
}
