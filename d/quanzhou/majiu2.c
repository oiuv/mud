#include <room.h>
inherit TRANS_ROOM;

void create()
{
      set("short","马厩");
      set("long",@LONG
这是嘉兴城的马厩，常年供应新鲜草料。马厩雨檐下的烂木柱上钉着
一块破木牌(paizi)。
    马厩中堆放著几堆草料，正中有一口泔槽。
LONG);
      set("outdoors", "jiaxing");
      set("no_fight", 1);
      set("objects", ([
                "/clone/horse/zaohongma": 1,
                "/clone/horse/huangbiaoma": 1,
                "/clone/horse/ziliuma": 1,
                "/clone/npc/mafu": 1,
      ]));
      set("exits",([ /* sizeof() == 1 */
                "northeast" : __DIR__"jxnanmen",
      ]));
      setup();
      replace_program(TRANS_ROOM);
}

