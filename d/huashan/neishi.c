// Room: /d/huashan/neishi.c

inherit ROOM;

void create()
{
        set("short", "内室");
        set("long", @LONG
这里有些昏暗，窗棂上落了少许灰尘，看来平时并没有人勤于打扫。
有一些剑宗弟子斜斜的靠在角落的床上沉沉的睡着。
LONG );
        set("exits", ([ /* sizeof() == 4 */
             "west": __DIR__"xiaowu",
        ]));
        set("no_fight", 1);
        set("sleep_room", 1);

        setup();
        replace_program(ROOM);
}
