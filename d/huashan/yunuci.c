#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "玉女祠");
        set("long", @LONG
玉女祠里供奉的到底是哪位玉女，有许多不同的说法，现在所能看到
的只一尊呆板的石像。祠中大石上有一处深陷，凹处积水清碧，这是玉女
的洗脸盆，碧水终年不干。玉女祠左边是一处山崖(cliff)，很是陡峭。
LONG
        );
        set("outdoors", "huashan");
        set("exits", ([
                "east" : __DIR__"yunu",
        ]));
        set("item_desc", ([
                "cliff" : "玉女祠下的山崖很是陡峭，似乎连接了一条小路。\n",
        ]));

        set("resource/water", 1);
        setup();
}

void init()
{
        add_action("do_jump", "jump");
}

int do_jump(string arg)
{
        object me = this_player();
        int n = me->query("dex");

        if (! arg || arg != "cliff")
        {
                write("你打算往哪里跳？\n");
                return 1;
        }

        message_vision( HIY "$N" HIY "深吸了一口气，飞身向山崖跳去。\n" NOR, me);

        if (n < 30)
        {
                message_vision( HIR "结果$N" HIR "惨叫了一声，跌下了山崖"
                                "。\n" NOR, this_player());

                me->move(__DIR__"kuihua_2");
                me->unconcious();

                message("vision", HIR "只听" + me->name() + HIR "一声惨叫"
                                  "，从上面的山峰上重重的摔了下来。\n" NOR,
                                  environment(me), ({me}) );
        } else
        {
                message_vision( HIC "只见$N" HIC "身法矫健，轻轻一纵，飘然落"
                                "至崖底。\n" NOR, this_player());

                me->move(__DIR__"kuihua_2");

                message("vision", HIC "只见" + me->name() + HIC "从上面的山峰轻轻"
                                  "的落了下来。\n", environment(me), ({me}) );
        }
        return 1;
}
