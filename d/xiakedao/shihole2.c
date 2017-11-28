// /d/xiakedao/shihole2.c 侠客岛 石洞2

inherit ROOM;

void create()
{
        set("short", "石洞");
        set("long", @LONG
此洞通向第二组石室。洞中水声淙淙，右面恰巧一道山泉流过。
中间四个草书大字深入石壁「飘渺烟云」，两侧均是蓝色帷幔环绕。
几名蓝衣弟子侍立。
LONG );
        set("exits", ([
                "out"   : __DIR__"shihole1",
                "enter" : __DIR__"shihole3",
                "north" : __DIR__"shiroom05",
                "south" : __DIR__"shiroom06",
                "east"  : __DIR__"shiroom07",
                "west"  : __DIR__"shiroom08",
        ]));
        set("objects", ([
                __DIR__"npc/maliu": 1,
        ]));
        setup();
        replace_program(ROOM);
}
