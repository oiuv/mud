inherit ROOM;

void create()
{
        set("short", "钱庄");
        set("long", @LONG
这是一家老字号的钱庄，已有几百年的历史，在全国各地
都有分店。它发行的银票信誉非常好，通行全国。
LONG);
        set("exits", ([
                "west" : __DIR__"nandajie1",
        ]));
        set("objects", ([
                __DIR__"npc/qian" : 1
        ]));

        setup();
        replace_program(ROOM);
}
