
inherit ROOM;

void create()
{
        set("short", "小屋");
        set("long", @LONG
这里是远离正厅的一间小屋，但见收拾得整整洁洁一尘不
染。摆设就如普通人家一般，红木的桌椅，细磁的杯壶，沉香
的大床。你简直想象不到这幽深的古墓之中还有这等摆设。
LONG
        );

        set("exits", ([
                "west" : __DIR__"xiaowu2",
        ]));

        set("objects", ([
                __DIR__"obj/ping" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
