inherit ROOM;

void create()
{
        set("short", "牢房");
        set("long", @LONG
这是一间阴暗潮湿的牢房，地上几只老鼠莫无旁人在那里
找东西吃。就只有铁门上的一个小窗户透一点光进来。这种地
方多呆一刻你就要发疯。
LONG);
        set("exits", ([
                "west" : __DIR__"xunbu",
        ]));

        setup();
        replace_program(ROOM);
}

