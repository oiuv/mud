#include <room.h>
inherit TRANS_ROOM;

void create()
{
        set("short", "马厩");
        set("long", @LONG
这是北京城的马厩，常年供应新鲜草料。北京自古天子脚
下，啥都有规矩，客店也特会伺候人，马夫们会把马牵到马厩
好生照看，将它们喂饱饮足，再洗刷得干乾净净，一直伺候到
客人上路。雨檐下的烂木柱上钉着块破木牌 (paizi)。马厩中
堆放著几堆草料，正中有一口泔槽。
LONG);
        set("outdoors", "beijing");
        set("no_fight", 1);
        set("objects", ([
                "/clone/horse/zaohongma": 1,
                "/clone/horse/huangbiaoma": 1,
                "/clone/horse/ziliuma": 1,
                "/clone/npc/mafu": 1,
                "/d/guanwai/npc/shenke" : 1,
        ]));

        set("exits",([
                "east" : __DIR__"niaoshi",
                "up"   : "/clone/shop/beijing_shop",
        ]));
        setup();
        replace_program(TRANS_ROOM);
}
