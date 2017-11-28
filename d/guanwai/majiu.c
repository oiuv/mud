#include <room.h>
inherit TRANS_ROOM;

void create()
{
      set("short","马厩");
      set("long",@LONG
这是关外的马厩，关外苦寒之地，颇乏新鲜草料。但东北大汉惯能吃
苦，马夫们会把马牵到马厩好生照看，将它们喂饱饮足，再洗刷得干乾净
净，一直伺候到客人上路。马厩雪披下的木柱上钉着一块破木牌(paizi)。
LONG);
      set("exits",([
                "east"      : __DIR__"kedian",
      ]));
      set("outdoors", "guanwai");
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
