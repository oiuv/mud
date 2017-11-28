#include <room.h>
inherit TRANS_ROOM;

void create()
{
      set("short","马厩");
      set("long",@LONG
这是草棚边的马厩，常年供应新鲜草料。马夫们会把马牵
到马厩好生照看，将它们喂饱饮足，再洗刷得干乾净净，一直
伺候到客人上路。马厩中堆放著几堆草料正中有一口泔槽。马
厩雨檐下的烂木柱上钉着一块破木牌(paizi)。
LONG);
      set("outdoors", "emei");
      set("exits",([
              "east"    : __DIR__"caopeng",
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
