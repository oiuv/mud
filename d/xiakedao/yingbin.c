// yingbin.c 迎宾馆

inherit ROOM;

void create()
{
        set("short", "迎宾馆");
        set("long", @LONG
这是一个石洞，地下的青石板铺得甚是整齐，两旁有一些木制家
具，整个房间并无特殊之处，但收拾得干干净净，一尘不染。东面是
一个小吃店，西面是休息室。
LONG );
        set("exits", ([
               "east" : __DIR__"xiaodian",
               "west" : __DIR__"xiuxis",
               "south" : __DIR__"shidong2",
               "out" : __DIR__"dongmen",
        ]));
        setup();
        replace_program(ROOM);
}
