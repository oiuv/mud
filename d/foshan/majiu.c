#include <room.h>
inherit TRANS_ROOM;

void create()
{
	set("short","马厩");
	set("long",@LONG
这里是佛山镇的马厩，常年供应新鲜草料。佛山民风淳朴
马夫们会把马牵到马厩好生照看，将它们喂饱饮足，再洗刷得
干乾净净，一直伺候到客人上路。马厩雨檐下的烂木柱上钉着
一块破木牌(paizi)。马厩中堆放著几堆草料。
LONG);
      set("exits",([
		"north" : __DIR__"yingxionglou",
                "up"    : "/clone/shop/foshan_shop",
      ]));
      set("outdoors", "foshan");
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
