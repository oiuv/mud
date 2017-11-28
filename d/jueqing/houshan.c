inherit ROOM;

void create()
{
        set("short", "后山");
        set("long", @LONG
谷西是绝情谷后山，这里地势偏僻平时很少有人来。俯瞰
山下千沟万壑，云雾缭绕。翘首北望，只见峭壁绝险，云雾深
锁。
LONG);
        set("outdoors", "jueqing");
        set("exits", ([
               "southeast" : __DIR__"shanlu3",
        ]));

        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
