#include <room.h>
inherit TRANS_ROOM;

void create()
{
        set("short","马厩");
        set("long",@LONG
这是客店后的马厩，常年供应新鲜草料。洛阳乃天下古城
历史悠久、民风淳朴，马夫们会把马牵到马厩好生照看，将它
们喂饱饮足，再洗刷得干乾净净。马厩雨檐下的烂木柱上钉着
块破木牌 (paizi)。马厩中堆放著几堆草料。
LONG);
        set("outdoors", "luoyang");
        set("no_fight", 1);
        set("objects", ([
              "/clone/horse/zaohongma": 1,
              "/clone/horse/huangbiaoma": 1,
              "/clone/horse/ziliuma": 1,
              "/clone/npc/mafu": 1,
        ]));
        set("exits",([
                "west" : __DIR__"kezhan",
                "up"   : "/clone/shop/luoyang_shop",
        ]));
        setup();
        replace_program(TRANS_ROOM);
}
