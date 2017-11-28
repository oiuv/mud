//room: xiaojing.c
inherit ROOM;

void create()
{
        set("short","小径");
        set("long",@LONG
这是个一条湖边的小径，西面就是一座小桥。周围湖光影
天，你不禁深吸了一口醉人的空气，陶醉于山水中。
LONG );
        set("outdoors", "yanziwu");
        set("exits",([
            "west"  : __DIR__"xiaoqiao",
            "south" : __DIR__"xiaoting",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

