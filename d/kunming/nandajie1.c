#include <ansi.h>
inherit ROOM;

void create()
{
        set("short",  "南大街" );
        set("long", @LONG
你走在昆明最繁华的街道上，人来人往，好不热闹，街的
两旁有许多贩卖商品的人，正在贩卖一些土特产，沿街有一些
店铺，西边是一家当铺，东边一个高高的晃字立了出来。
LONG);
        set("outdoors", "kunming");

        set("exits", ([
                "south" : __DIR__"nandajie2", 
                "north" : __DIR__"jinrilou",
                "west"  : __DIR__"dangpu",
                "east" : __DIR__"jiulou",
        ]));
        set("objects", ([
                "/d/beijing/npc/hunhun" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
