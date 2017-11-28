//Room: gongbu-tong.c

#include <ansi.h>
#include <room.h>

inherit PRODUCING_ROOM;

void create ()
{
        set ("short", "工部石厂");
        set ("long", @LONG
这是工部的收集石料，选料打磨的地方。拣选来自全国各地运来的
石料，分门别类，供京城建筑使用。
LONG);
        set("exits",  ([ //sizeof() == 2
                "north" : __DIR__"gongbu",
        ]));

        set("objects", ([
                __DIR__"npc/worker-wang" : 1,
        ]));

        set("no_fight", 1);
        set("no_sleep_room", 1);

        set("product/perfect-stone", ([ "name" : "精石",
                                        "rate" : 300,
                                        "max"  : 50000,
                                        "cost" : ({ "stone" }), ]));

        set("product/stone", ([ "name" : "石料",
                                     "max"  : 50000,
                                     "rate" : 100, ]));

        setup();

        set_heart_beat(120);
        replace_program(PRODUCING_ROOM);
}
