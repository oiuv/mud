inherit ROOM;

void create()
{
        set("short", "静室");
        set("long", @LONG
这是一个昏暗的房间，除了几张床之外什么都没有。室内光线昏
暗，你不由的打了一个哈欠。
LONG);
        set("sleep_room", 1);
        set("no_fight", 1);

        set("exits", ([
                "north" : __DIR__"dating",
        ]));

        setup();
        //replace_program(ROOM);
}
