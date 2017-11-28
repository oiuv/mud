inherit ROOM;

void create()
{
        set("short", "西厢房");
        set("long", @long
西厢房原是杜庄主的卧室的所在，床帐几桌、一应起居之具齐备，陈设
得甚是考究。        
long );
        set("exits", ([
                "east"    : __DIR__"zoulang5",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
