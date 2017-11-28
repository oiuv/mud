#include <ansi.h>
inherit ROOM;

void create()
{
      set("short", "九十九道拐");
      set("long", @LONG
这是便是著名的「九十九道拐」，道路纡曲陡竖，千折百
回。据说过去曾有个百余岁的疯僧至此，见一巨蟒挡路，便念
咒驱蟒。但人们得知此处有巨蟒出没后，便再也无人敢碰这里
的草木，并以「龙居」名之。东可至千佛庵，西达九老洞。
LONG);
      set("outdoors", "emei");
      set("exits", ([
          "westup"   : __DIR__"jsjdg2",
          "eastdown" : __DIR__"qianfoan",
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

                        tell_object(me, HIC "你爬上九十九道拐，有些累了。\n" NOR);
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