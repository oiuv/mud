//Room: gongbu-tong.c

#include <ansi.h>
#include <room.h>

inherit PRODUCING_ROOM;

void create ()
{
        set ("short", "工部铜厂");
        set ("long", @LONG
这是工部的冶铜场地，专门拣选来自全国各地运来的铜矿石，然后
溶化冶炼精铜，最后铸成铜锭发到全国各地，当然一个主要用途是用来
铸造国家发行的货币。
LONG);
        set("exits",  ([ //sizeof() == 2
                "south" : __DIR__"gongbu",
        ]));

        set("objects", ([
                __DIR__"npc/worker-liu" : 1,
        ]));

        set("no_fight", 1);
        set("no_sleep_room", 1);

        set("product/cuprum", ([ "name" : "黄铜",
                                 "rate" : 100,
                                 "max"  : 10000,
                                 "cost" : ({ "cuprum_ore" }), ]));

        set("product/cuprum_ore", ([ "name" : "铜矿石",
                                     "max"  : 10000,
                                     "rate" : 50, ]));

        setup();

        set_heart_beat(120);
        replace_program(PRODUCING_ROOM);
}
