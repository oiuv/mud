#include <room.h>
inherit TRANS_ROOM;

void create()
{
        set("short","马厩");
        set("long",@LONG
这是客栈边上的马厩，常年供应新鲜草料。据说此地民风淳朴，客
人只要住店，马夫们就会把马牵到马厩好生照看，将它们喂饱饮足，再
洗刷得干乾净净。一直伺候到客人离店上路。马厩中堆放著几堆草料，
正中有一口泔槽。马厩雨檐下的烂木柱上钉着一块破木牌(paizi)。
LONG);
      set("outdoors", "huanghe");
      set("exits",([
                "east"      : __DIR__"kedian",
      ]));
      set("no_fight", 1);
      set("objects", ([
                "/clone/horse/zaohongma": 1,
                "/clone/horse/huangbiaoma": 1,
                "/clone/horse/ziliuma": 1,
                "/clone/npc/mafu": 1,
      ]));
      setup();
      replace_program(TRANS_ROOM);
}
