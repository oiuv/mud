// regiser: prison.c
// by Doing

#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", HIR "第十八层地狱" NOR);
        set("long", @LONG
这里极度阴森，你感到无数的鬼魂到处游荡，骇得你大气也不敢透
一口，只想赶快离开这里。也不知道在这里会呆多久，想到这里，你不
禁感到深深的懊恼。
    旁边有一个牌子(paizi)。
LONG );
        set("no_fight", 1);
        set("item_desc", ([
                "paizi" : "第十八层地狱，你想翻身？那就试试！\n"
        ]));
}

void init()
{
        add_action("do_suicide", "suicide");
        add_action("do_drop", "drop");
        add_action("do_give", "give");
        add_action("do_eat", "eat");
        add_action("do_drink", "drink");
}

int do_eat()
{
        write("老实点！\n");
        return 1;
}

int do_drink()
{
        write("老实点！\n");
        return 1;
}

int do_suicide()
{
        write("在这冥府你也想自杀，省省吧！\n");
        return 1;
}

int do_give()
{
        write("这里不能给东西！\n");
        return 1;
}

int do_drop()
{
        write("这里不能乱仍东西！\n");
        return 1;
}

void catch_back(object me)
{
        message_vision(HIM "忽然一阵诡秘的烟雾弥漫在四周，两个青面獠牙"
               "的小鬼跳了出来，一把抓住$N" HIM "，用\n铁链锁住，恶狠"
               "狠的叫道：“好家伙！我让你跑...”\n\n" NOR,
               me);

        message("vision", HIY "忽的一道金光，你登时什么也看不到了...\n\n"
                  HIM "烟雾渐渐的散去... " + me->name() +
                  "不见了？！！\n\n" NOR,
                  environment(me), ({ me }));
}

void catch_ob(object me)
{
        message_vision(HIM "忽然一阵诡秘的烟雾弥漫在四周，两个青面獠牙"
                       "的小鬼跳了出来，一把抓住$N" HIM "，用\n铁链锁住，恶狠"
                       "狠的叫道：“站住！你犯案了，快跟我们走吧！”\n\n" NOR,
                       me);

        message("vision", HIY "忽的一道金光，你登时什么也看不到了...\n\n"
                          HIM "烟雾渐渐的散去... " + me->name() +
                          "不见了？！！\n\n" NOR,
                          environment(me), ({ me }));
}

int free_ob(object me)
{
        string startroom;

        message_vision("忽然两个小鬼冒了出来，拎住$N，道：好了，你可以"
                       "走了，要是再敢犯案，哼哼...\n\n", me);
        message("vision", "两个小鬼和" + me->name() + "突然在你面前消"
                          "失了... 你不禁叹了一口气。\n",
                          environment(me), ({ me }));

        tell_object(me, HIR "你眼前一黑...\n\n" NOR);

        if (me->is_ghost())
                startroom = "/d/death/gate";
        else
                startroom = "/d/city/wumiao";

        me->set("startroom", startroom);
        me->move(startroom);
        message("vision", "一阵诡秘的烟雾过后，只见" + me->name() +
                          "直挺挺的躺在地上。\n", environment(me), ({ me }));
	return 1;
}

