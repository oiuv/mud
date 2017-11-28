// Room: /t/wanjiegu/riverside2.c

inherit ROOM;

void create()
{
        set("short", "江边小路");
        set("long", @LONG
这是澜沧江边的一条小路，江水滔滔，从下面奔腾而过，江面
上不时传来艄公的号子声，与江风的呼啸声形成一曲动人的交响乐。
LONG
        );
        set("outdoors", "wanjiegu");
        set("exits", ([ /* sizeof() == 3 */
                "southeast" : "/d/dali/road3",
                "southdown" : __DIR__"riverside1",
                "northdown" : __DIR__"riverside3",
        ]));

        setup();
        replace_program(ROOM);
}
