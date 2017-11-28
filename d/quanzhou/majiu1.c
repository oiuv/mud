#include <room.h>
inherit TRANS_ROOM;

void create()
{
      set("short","马厩");
      set("long",@LONG
这是泉州城的马厩，常年供应新鲜草料。泉州商业发达，因此这里生
意兴隆，马夫们好生照看马匹，将它们喂饱饮足，再洗刷得干乾净净，一
直伺候到客人上路。马厩雨檐下的烂木柱上钉着一块破木牌(paizi)。
    马厩中堆放著几堆草料，正中有一口泔槽。
LONG);
      set("outdoors", "quanzhou");
      set("no_fight", 1);
      set("objects", ([
                "/clone/horse/zaohongma": 1,
                "/clone/horse/huangbiaoma": 1,
                "/clone/horse/ziliuma": 1,
                "/clone/npc/mafu": 1,
      ]));
      set("exits",([ /* sizeof() == 1 */
                "northwest" : __DIR__"zhongxin",
      ]));
      setup();
      replace_program(TRANS_ROOM);
}

