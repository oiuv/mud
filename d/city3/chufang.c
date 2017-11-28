inherit ROOM;
void create()
{
        set("short", "酒楼厨房");
        set("long", @LONG
这里是酒后后面的厨房，几个大水池前面有不少的伙计在
摘菜和清洗碗碟，还有一些伙计站在油烟直冒的油锅面前努力
的翻炒着各色菜肴，而一个粗手大脚的中年厨娘大声吆喝，指
手画脚的却不干活。
LONG);
        set("exits", ([
                "west" : __DIR__"jiudian",
        ]));
        set("objects", ([
                __DIR__"npc/chuniang" : 1,
        ]));
        set("no_fight", 1);
        set("no_sleep_room", 1);
        setup();
        replace_program(ROOM);
}
