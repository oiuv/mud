inherit ROOM;

void create()
{
        set("short", "江边小路");
        set("long", @LONG
这是澜沧江边的一条小路，江水滔滔从下面奔腾而过，江
面上不时传来艄公的号子声，与江风的呼啸声形成一曲动人的
交响乐，令人精神为之一振。
LONG);
        set("outdoors", "wanjiegu");
        set("exits", ([
                "northup" : __DIR__"riverside2",
        ]));
        setup();
        replace_program(ROOM);
}
