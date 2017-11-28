// Room: chaopath2.c 朝阳峰小路
//Date: Oct. 2 1997 by Venus
inherit ROOM;

void create()
{
      set("short","朝阳峰小路");
      set("long",@LONG
这里是朝阳峰小路，山势陡峭，两边下临深谷，一不小心都会掉
了下去。西面有一条小路，长草没径。
LONG);
      set("outdoors", "huashan");
      set("exits",([ /* sizeof() == 1 */
          "southwest": __DIR__"chaopath1",
          "eastup"   : __DIR__"chaoyang",
          "westup"   : __DIR__"ziqitai",
      ]));
      set("objects", ([
          __DIR__"npc/shi-daizi" : 1,
      ]));
      setup();
}
 
void init()
{
        object me = this_player();
        if (me->query_temp("xunshan")) me->set_temp("xunshan/chaoyang", 1);
        return;
}

int valid_leave(object me, string dir)
{
        if (dir != "eastup"  ||
            ! objectp(present("shi daizi", environment(me))) ||
            (me->query("family/master_id")!="gao laozhe") ||
            (me->query("family/master_id")!="ai laozhe"))
                return ::valid_leave(me, dir);

        if (me->query("family/family_name") != "华山派")
        {
                message_vision("施戴子伸手拦住$N，道：抱歉，上面是两位"
                               "长老清修之处，这位" + RANK_D->query_respect(me) +
                               "请止步！\n", me);
                return notify_fail("看来施戴子不会让你过去。\n");
        }

        if (me->query("combat_exp") < 100000)
        {
                message_vision("施戴子伸手拦住$N，道：止步！上面是两位"
                               "长老清修之处，你虽然是本派弟子，但是学"
                               "艺不精，不能拜见！\n", me);
                return notify_fail("看来施戴子不会让你过去。\n");
        }

        return ::valid_leave(me, dir);
}
