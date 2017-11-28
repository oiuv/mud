inherit ROOM;

void create()
{
        set("short", "东厢房");
        set("long", @long
东厢房原是杜庄主款待宾客的所在，床帐、屏风、几桌、一应起居之具
齐备，陈设得甚是考究。        
long );
        set("exits", ([
                "west"    : __DIR__"zoulang6",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
