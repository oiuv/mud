inherit ROOM;

void create()
{
        set("short", "地牢");
        set("long", @LONG
这里是大轮寺内的一个阴暗、潮湿的牢房。你感到奇怪的
是怎麽会不时听到一点怪声却怎么也找不到人呢。
LONG);
        set("exits", ([
                "southup" : __DIR__"houyuan",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
