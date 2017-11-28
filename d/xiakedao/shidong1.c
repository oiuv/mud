// ROOM: /xiakedao/shidong1.c
inherit ROOM;

void create()
{
        set("short", "石洞");
        set("long", @LONG
这是一个石洞，也不知走了多久，只觉越走越低，洞中出现了流
水之声，淙淙争争，清脆悦耳，如击玉磬。
LONG );
        set("exits", ([
               "east" : __DIR__"dongmen",
               "north" : __DIR__"yongdao2",
               "south" : __DIR__"shidong6",
        ]));
        setup();
        replace_program(ROOM);
}
