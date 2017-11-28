inherit ROOM;

void create()
{
        set("short", "扬州武馆");
        set("long", @LONG
扬州武馆是专为初出江湖的少年设立的。由于江湖叛师是
十分为人不齿的，初出道的少年可以在此学习一些基本的防身
武功，一来不会让光阴虚度，二来也好为今后选定一个心慕的
门派。墙上贴着个贴子。
LONG);
        set("objects", ([
                __DIR__"npc/chen" : 1,
        ]));
        set("no_fight", 1);
        set("no_steal", 1);
        set("no_beg", 1);
        set("exits", ([
                "north"     : __DIR__"xidajie2",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}


