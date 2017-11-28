#include <ansi.h>
inherit ROOM;

void create()
{
      set("short", "钻天坡");
      set("long", @LONG
莲花石与洗象池之间，道路陡绝石栈若齿，直上蓝天，石
蹬达一千三百多级，是在陡峭山壁上开凿出来的坡道。人行其
上，前后顶踵相接，一如登天。这段路叫「鹁鸽钻天」，这段
陡坡也因此而叫「钻天坡」。这里西上坡顶便到洗象池，东下
可达莲花石。
LONG);
      set("outdoors", "emei");
      set("exits", ([
          "eastdown"  : __DIR__"ztpo1",
          "westup"    : __DIR__"xixiangchi",  
      ]));
      setup();
}
/*
int valid_leave(object me, string dir)
{
        int c_skill;

        me = this_player();
        if (dir == "westup")
        {
                c_skill = me->query_skill("dodge", 1);
                if (me->query("qi") > 40)
                {
                        me->receive_damage("qi", 20 + random(20));

                        if (me->can_improve_skill("dodge") && c_skill < 100)
                                me->improve_skill("dodge", 1 + c_skill / 15);

                        tell_object(me, HIC "你爬上洗象池，有些累了。\n" NOR);
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