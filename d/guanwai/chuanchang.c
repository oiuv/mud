#include <ansi.h>
inherit RIVER;

void create()
{
        set("short", "船厂");
        set("long", @LONG
这里是古镇船厂。船厂是位于关外大平原中部的一个古老
的小镇，此镇西、南、北、三面是以高墙垒筑利于坚守。东面
临松花江天成天险，乃兵家必争的要地。松花江 (river)在冬
春时结冰可通行，夏秋化冻你只好找船家帮忙了。
LONG);
        set("arrive_room", "/d/guanwai/damenkan");
        set("exits", ([
                "south" : __DIR__"xuedi3",
        ]));
        set("objects", ([
                __DIR__"npc/chuanfu" : 1,
        ]));
        set("resource/fish", ({ "/clone/fish/liyu",
                                "/clone/fish/jiyu",
                                "/clone/fish/qingyu",
                                "/clone/fish/caoyu", }));

        set("outdoors", "guanwai");
        setup();
        replace_program(RIVER);
}
