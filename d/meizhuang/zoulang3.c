inherit ROOM;

void create()
{
        set("short", "走廊");
        set("long", @LONG
这是一条长长的走廊，走廊两边是四位庄主中的其他三位平时休
息和练功的地方，左边就是梅庄的厨房。走廊到了这里似乎就到了尽
头，再往前便是梅庄的后厅了。
LONG
        );
        set("exits", ([
            "north" : __DIR__"houting",
            "south" : __DIR__"zoulang2",
            "west"  : __DIR__"chufang",  
        ]));
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

