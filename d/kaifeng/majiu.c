#include <room.h>
inherit TRANS_ROOM;

void create()
{
      set("short", "马厩");
      set("long", @LONG
这是稻香居后的马厩，常年供应新鲜草料。开封府自古乃
军事重地，历史悠久，民风淳朴。马夫们会把马牵到马厩好生
照看，将它们喂饱饮足，再洗刷得干乾净净，一直伺候到客人
上路。马厩雨檐下的烂木柱上钉着一块破木牌 (paizi)。马厩
中堆放著几堆草料，正中有一口泔槽。
LONG);
        set("outdoors", "kaifeng");
        set("no_fight", 1);
        set("objects", ([
                "/clone/horse/zaohongma": 1,
                "/clone/horse/huangbiaoma": 1,
                "/clone/horse/ziliuma": 1,
                "/clone/npc/mafu": 1,
        ]));
        set("exits",([
               "west" : __DIR__"daoxiang",
               "up"   : "/clone/shop/kaifeng_shop",
        ]));
        setup();
        replace_program(TRANS_ROOM);
}
