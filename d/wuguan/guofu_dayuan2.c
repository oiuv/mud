inherit ROOM;

void create()
{
        set("short", "郭府大院");
        set("long", @LONG
这是个大院子，东西两边都是练武场，不少人在这里习武
强身，大院里很是吵闹，乱烘烘的，你看见不时有扛着东西的
挑着水的人匆匆而过，北面上了台阶就是郭府的大厅。
LONG);
        set("no_fight", 1);
        set("exits", ([
                "south" : __DIR__"guofu_dayuan",
                "north" : __DIR__"guofu_dating",
        ]));
        set("objects", ([
           	__DIR__"npc/yelvqi" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
