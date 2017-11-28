#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
这个山洞里伸手不见五指，黑沉沉的甚么也瞧不见。
LONG);
        setup();
}

void init()
{
        add_action("do_use", "use");
        add_action("do_tiao", "tiao");
        add_action("do_tiao", "jump");
}

int do_use(string arg)
{
        object me = this_player();

        if (! arg || arg == "" ) 
                return 0;

        if (! present("fire", me))
                return 0;

        if (this_object()->query("mark/light"))
                return notify_fail("你已经点着火折了。\n");

        if (arg == "fire")
        {
                message_sort(HIR "\n$N" HIR "取出火折一晃，火光下只见四"
                             "面石壁都是晶莹白玉，地下放着几张桌椅，伸手"
                             "在桌上一按，桌子居然仍是坚牢完固，原来山洞"
                             "密闭，不受风侵，是以洞中物事并不朽烂。\n\n"
                             NOR, me);

                set("long", @LONG
借着微弱的火光，只见四面石壁(wall)都是晶莹白玉，地
下放着几张木制桌椅。你伸手在桌上一按，桌子居然仍是坚牢
完固，原来山洞密闭，不受风侵，是以洞中物事并不朽烂。

LONG);

                set("item_desc", ([
                        "wall" : WHT "只见石壁上有一大裂缝，从黑黢黢的裂"
                                 "缝里飘出阵阵的阴风。\n" NOR, 
                ]));
                add("mark/light", me->query("id"));
                return 1;
       }
}

int do_tiao(string arg)
{
        object ob, me = this_player();

        if (! this_object()->query("mark/light"))
                return notify_fail("洞里一片漆黑，你根本探不清方向。\n");

        if (! arg || arg != "down")
                return notify_fail("你要往哪跳？\n");

        message_vision(HIY "\n$N" HIY "豫了一下，鼓气勇气，跳了下去。\n\n" NOR, me);

        // 判断是谁点燃的火折，如果持火折者跳了下去，则恢复黑暗。
        if (this_object()->query("mark/light") == me->query("id"))
        {
                delete("mark/light");
                set("long", "山洞里伸手不见五指，黑沉沉的甚么也瞧不见。\n");

                message("vision", HIR + me->name() + HIR "径自拿着火折跳了下去"
                        "，洞内随即又是一片漆黑。\n" NOR, environment(me), ({me}));
        }

        if ((int)me->query_skill("dodge", 1) < 150 )
        {
                me->move(__DIR__"yongdao2");
                me->receive_wound("qi", 300);
                me->unconcious();
                message("vision", HIR "\n突然听得「砰」的一声，只见一个人从上"
                                  "面的山峰上坠了下来，真是壮观。\n" NOR,
                                  environment(me), ({me}));
        } else
        {
                me->move(__DIR__"yongdao2");
                message("vision", HIY + me->name() + HIY "从上面跳了下来。\n" NOR,
                                  environment(me), ({me}));
        }
        return 1;
}
