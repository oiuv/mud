#include <room.h>
inherit TRANS_ROOM;

void create()
{
      set("short","马厩");
      set("long",@LONG
这是南阳城的马厩，常年供应新鲜草料。南阳地处中原，来往的行人
络绎不绝。马厩雨檐下的烂木柱上钉着一块破木牌(paizi)。
    马厩中堆放著几堆草料，正中有一口泔槽。
LONG);
      set("outdoors", "nanyang");
      set("no_fight", 1);
      set("objects", ([
                "/clone/horse/zaohongma": 1,
                "/clone/horse/huangbiaoma": 1,
                "/clone/horse/ziliuma": 1,
                "/clone/npc/mafu": 1,
      ]));
      set("exits",([ /* sizeof() == 1 */
                "west" : __DIR__"kedian1",
      ]));
      setup();
      replace_program(TRANS_ROOM);
}

