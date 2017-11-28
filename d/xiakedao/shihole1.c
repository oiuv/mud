// /d/xiakedao/shihole1.c 侠客岛 石洞1

inherit ROOM;

void create()
{
        set("short", "石洞");
        set("long", @LONG
这里依次是六个石洞，各自通向四句诗的石室。后人研习「侠客
行」武功，悟出六句总纲，也分别刻在这里。此洞一色青布帷幔，侍
立的弟子均是青衣长剑。正面壁上，粗隶刻着前四句诗的总纲「一剑
飞鸿」。
LONG );
        set("exits", ([
                "out"   : __DIR__"neiting",
                "enter" : __DIR__"shihole2",
                "north" : __DIR__"shiroom01",
                "south" : __DIR__"shiroom02",
                "east"  : __DIR__"shiroom03",
                "west"  : __DIR__"shiroom04",
        ]));
        set("objects", ([
                __DIR__"npc/wangwu": 1,
        ]));
        setup();
        replace_program(ROOM);
}
