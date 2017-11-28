inherit ROOM;

void create()
{
        set("short", "遇真宫");
        set("long", @LONG
这里是进入武当山的第一道宫宇遇真宫，宽敞无比，可容
千人食宿，是进香客的一大歇脚处。三丰真人曾在此结庵修炼，
因此宫中供着张三丰真人像。由于张真人闭关已久，外人不知
其是否仍在人间，民间传说他已得道仙逝，立像膜拜。
LONG);
        set("objects", ([
                CLASS_D("wudang") + "/zhixiang": 1,
        ]));
        set("outdoors", "wudang");
        set("exits", ([
                "northdown": __DIR__"shijie1",
                "southup"  : __DIR__"wdbl",
        ]));
        setup();
        replace_program(ROOM);
}
