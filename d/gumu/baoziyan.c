
inherit ROOM;

void create()
{
        set("short", "抱子岩");
        set("long", @LONG
一路过来，山路是越来越险。只见光秃秃的山路，左旁尽
是怪石，而右则是万丈深渊，渺不见底。前方不远处的一块巨
石，便是有名的抱子岩。再看几眼，觉那岩生得甚是奇怪，就
如一个妇人抱着个孩子般，细心呵护。往南和西各是一片密林。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "west"      : __DIR__"shulin8",
                "south"     : __DIR__"shulin9",
        ]));
        set("objects", ([
                CLASS_D("quanzhen") + "/chen" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
