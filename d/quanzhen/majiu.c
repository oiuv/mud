#include <room.h>
inherit TRANS_ROOM;

void create()
{
      set("short","马厩");
      set("long",@LONG
这是武功镇的马厩，因为平时来往的人不多，显得有些破
旧。马厩雨檐下的烂木柱上钉着一块破木牌 (paizi)。厩中堆
放著几堆草料，正中有一口泔槽。
LONG);
      set("outdoors", "wugong");
      set("no_fight", 1);
      set("objects", ([
                "/clone/horse/zaohongma": 1,
                "/clone/horse/huangbiaoma": 1,
                "/clone/horse/ziliuma": 1,
                "/clone/npc/mafu": 1,
      ]));
      set("exits",([ /* sizeof() == 1 */
                "south" : __DIR__"kedian1",
      ]));
      setup();
      replace_program(TRANS_ROOM);
}

