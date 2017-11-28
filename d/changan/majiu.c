#include <room.h>
inherit TRANS_ROOM;

void create()
{
        set("short", "马厩");
        set("long", @LONG
这里是长安城的马厩，常年供应新鲜草料。长安民众富裕
来往商贾甚多，因此马夫们对马好生照看，将它们喂饱饮足再
洗刷得干乾净净，一直伺候到客人上路。马厩雨檐下的烂木柱
上钉着块破木牌 (paizi)。马厩中堆放著几堆草料。
LONG);
        set("outdoors", "changan");
        set("no_fight", 1);
        set("objects", ([
                "/clone/horse/zaohongma" : 1,
                "/clone/horse/huangbiaoma" : 1,
                "/clone/horse/ziliuma" : 1,
                "/clone/npc/mafu" : 1,
        ]));
        set("exits",([
                "south" : __DIR__"huarui1",
                "up"    : "/clone/shop/changan_shop",
        ]));
        setup();
        replace_program(TRANS_ROOM);
}

