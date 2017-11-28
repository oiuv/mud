//Room: stone 领悟玄铁剑法的地方
//Modify by Rcwiz for hero.cd

#include <ansi.h>

inherit ROOM;

void create()
{
        set("short","巨石上");
        set("long",@LONG
这里是华山瀑布下的一块天然巨大石头上，周围尽是湍急的水流，汹
涌的高山洪水（hongshui）倾泄而下拍打在你身上。
LONG);
        set("outdoors", "huashan");
        set("can_practice_xiantie-jian", 1);
        set("item_desc", ([
                "hongshui" : HIW "洪水汹涌无比，你只觉随时有可能被洪水冲到水中。\n" NOR,
        ]));
        setup();
}

void init()
{
        add_action("do_jump", "jump");
}

int do_jump()
{
        object me = this_player();

        if (me->is_busy() || me->is_fighting())
              return notify_fail("你忙完了再说吧！\n");

        message_vision(HIG "$N" HIG "纵身跳上瀑布 ……\n", me);

        me->move(__DIR__"shanhongpb");

        return 1;
}

