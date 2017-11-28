inherit ROOM;

void create()
{
        set("short", "侧洞");
        set("long", @LONG
这里是一个小小的山洞，地上铺了很多茅草，非常的干燥。
光线有些昏暗，只是西面透出一些亮光。你不禁觉得有些疲倦
了，一时忍不住想躺下睡睡。
LONG);
        set("sleep_room", 1);
        set("no_fight", 1);
        set("exits", ([
                "west" : __DIR__"shandong3",
        ]));
        setup();
        replace_program(ROOM);
}
