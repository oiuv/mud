// road6.c 山路

inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
你走在一条岩石嶙峋的山道上，这是通向侠客岛望云台的唯一路
径，旁边是万丈悬崖，抬头隐约可见笼罩在云雾中的山峰，一条山路
环山而行。
LONG );
        set("outdoors", "xiakedao");
        set("exits", ([
                "southup" : __DIR__"road7",
                "northdown" : __DIR__"road5",
        ]));
        setup();
        replace_program(ROOM);
}

