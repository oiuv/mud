// /guanwai/baozang.c

inherit ROOM;

void create()
{
        set("short", "闯王宝藏");
        set("long", @long
一踏进石门，一阵金光照射，人人眼花撩乱，凝神屏气，个个张大了口合不
拢来。原来里面竟是个极大的洞穴，四面堆满了金砖银块，珍珠宝石，不计
其数。只是金银珠宝都隐在透明的坚冰之后。料想当年闯王的部属把金银珠
宝藏入之后，浇上冷水。该地终年酷寒，坚冰不融，金珠就似藏在水晶之中
一般。       
long );
        set("exits", ([
                "out"    : __DIR__"shimen",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
