inherit ROOM;

void create()
{
        set("short", "棋室");
        set("long", @LONG
这里便是二庄主黑白子的棋室了，棋室里两张石凳，一张石几，
石几上用黑白子的指力刻着纵横九九八十一道，这里除了简单的放着
两盒用玉做成的棋子外，什么都没有，显是怕双方对弈时分心。只不
过现在二庄主不知道到那里去了，只剩下一副棋盘棋子在这里。
LONG
        );
        set("exits", ([
                "east" : __DIR__"zoulang2",
        ]));

        set("objects", ([
                __DIR__"obj/qizi" : 1,
                __DIR__"obj/qipan" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
