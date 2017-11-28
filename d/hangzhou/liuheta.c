// liuheta.c
// Date: Nov.1997 by Venus
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "六和塔底");
        set("long", @LONG
爬上月轮山，便来到了六和塔之前。六和塔亦名六合塔，“六和”
之名来之佛家的六种规约，“六合”就是“天，地，四方”的意思。
这座八角塔有十三层，在它的飞檐翘角上括有一百零四只大铁铃。
LONG);
        set("exits", ([
            "eastdown" : __DIR__"qiantang",
            "enter"    : __DIR__"liuhe1",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
