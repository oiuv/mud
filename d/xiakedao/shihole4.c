// /d/xiakedao/shihole4.c 侠客岛 石洞4

inherit ROOM;

void create()
{
        set("short", "石洞");
        set("long", @LONG
此洞气氛却又大不相同，却似来到火焰山一般。只见一色红布帷
幔，八支粗大的红烛分列四角。一旁站立的是虬髯大汉，各佩弯刀，
刀柄上红樱低垂。正中大字是雄健的魏碑体：「烈焰豪情」。
LONG );
        set("exits", ([
                "out"   : __DIR__"shihole3",
                "enter" : __DIR__"shihole5",
                "north" : __DIR__"shiroom13",
                "south" : __DIR__"shiroom14",
                "east"  : __DIR__"shiroom15",
                "west"  : __DIR__"shiroom16",
        ]));
        setup();
	replace_program(ROOM);
}
