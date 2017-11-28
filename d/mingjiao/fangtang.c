//Room: /d/mingjiao/fangtang.c

inherit ROOM;
string* names = ({
        "/d/emei/obj/mala-doufu",
        "/d/emei/obj/bocai-fentiao",
        "/d/emei/obj/shanhu-baicai",
        "/d/emei/obj/liuli-qiezi",
        "/d/hangzhou/npc/obj/fish",
        "/d/hangzhou/npc/obj/pork",
        "/d/hangzhou/npc/obj/shrimp",
        "/d/hangzhou/npc/obj/geng",
        "/d/hangzhou/npc/obj/chicken",
        "/d/hangzhou/npc/obj/baozi",
});

void create()
{
      set("short","明教饭堂");
      set("long",@LONG
这里便是明教的饭堂。摆满了长长的餐桌和长凳，几位年轻教
众正来回忙碌着布置。桌上摆了几盆豆腐，花生，青菜以及大鱼，
大肉，鸡，酒等美味食。东边的走廊通向广场。
LONG);
      set("exits",([ /* sizeof() == 1 */
          "east" : __DIR__"square", 
      ]));

      set("objects",([
          "/d/hangzhou/npc/obj/jiuping": 1,
           names[random(sizeof(names))]: 1,
           names[random(sizeof(names))]: 1,
           names[random(sizeof(names))]: 1,
           names[random(sizeof(names))]: 1,
           names[random(sizeof(names))]: 1,
      ]));
      setup();
      replace_program(ROOM);
}
