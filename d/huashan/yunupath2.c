//Room: yunupath2.c 玉女峰山路
//Date: Oct. 2 1997 by Venus
inherit ROOM;

void create()
{
      set("short","玉女峰山路");
      set("long",@LONG
这里是玉女峰后山的一条山路。路边长满了翠竹，每当微风拂过
，竹叶便沙沙作响，显得分外的幽静。
LONG);
      set("outdoors", "huashan");
      set("no_clean_up", 0);
      set("exits",([ /* sizeof() == 1 */
          "southup"   : __DIR__"siguoya",
          "northdown" : __DIR__"yunupath1",
      ]));
      setup();
      replace_program(ROOM);
}
