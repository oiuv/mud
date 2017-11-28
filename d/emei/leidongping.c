#include <ansi.h>
inherit ROOM;

void create()
{
      set("short", "雷洞坪");
      set("long", @LONG
雷洞坪一带道路艰险骇人，路左是蔽日遮天的冷杉林，路
右是深不见底的绝壁峡谷。这里长年云遮雾罩空蒙黑暗。岩上
建有雷神殿，旁边竖一铁碑。由此往上是「八十四盘」至接引
殿，北下到洗象池。
LONG);
      set("outdoors", "emei");
      set("exits", ([
          "northdown"  : __DIR__"lingyunti",
          "southup"    : __DIR__"bashisipan1",
          "east"       : __DIR__"lengsl1",
      ]));
      setup();
}
/*
int valid_leave(object me, string dir)
{
        int c_skill;

        me = this_player();
        if (dir == "southup")
        {
                c_skill = me->query_skill("dodge", 1);
                if (me->query("qi") > 40)
                {
                        me->receive_damage("qi", 20 + random(20));

                        if (me->can_improve_skill("dodge") && c_skill < 100)
                                me->improve_skill("dodge", 1 + c_skill / 15);

                        tell_object(me, HIC "你爬上八十四盘，有些累了。\n" NOR);
                } else
                {
                        me->set("qi", 0);
                        tell_object(me, HIR "你太累了，再也走不动了。\n" NOR);
                        return -1;
                }
      }
      return 1;
}
*/