#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "八十四盘");
        set("long", @LONG
八十四盘，道路艰险陡峭，迂回盘折，令人不能喘息。路
左是蔽日遮天的冷杉林，路右是深不见底的绝壁峡谷。由此往
上至接引殿，北下到洗象池。
LONG);
        set("outdoors", "emei");
        set("exits", ([
                "southup"   : __DIR__"bashisipan3",
                "northeast" : __DIR__"bashisipan1",
                "east"      : __DIR__"lengsl3",
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