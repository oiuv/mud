inherit ROOM;

void create()
{
        set("short", "静修室");
        set("long", @LONG
这里是静修室，地下顺序地放着几个蒲团，正中烧着几柱
香，轻烟袅袅升起。几位昆仑派弟子正盘膝坐在上面打坐静修。
LONG);
        set("exits", ([
                "east"  : __DIR__"shilu1",
        ]));
        set("sleep_room", 1);
        set("no_fight", 1);

        setup();
        replace_program(ROOM);
}
