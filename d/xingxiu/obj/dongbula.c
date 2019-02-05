#include <ansi.h>
inherit ITEM;

void create()
{
    set_name(YEL "冬不拉" NOR, ({ "dongbula" , "dong", "bula" }));
    if (clonep())
            set_default_object(__FILE__);
    else {
        set("unit", "把");
        set("long", YEL "这是一把维吾尔族的弦乐器冬不拉。你可以演奏(play)它。\n" NOR);
        set("value", 1000);
    }
}

void init()
{
        add_action("do_play", "play");
}

int do_play(string arg)
{
        object me = this_player();

        if (! id(arg))
                return notify_fail("你要演奏什么？\n");

        if (this_object() != me->query_temp("handing"))
                return notify_fail("你必须把冬不拉拿在手中。\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

        me->start_busy(1);
        switch(random(3))
	{
                case 0:
        		message_sort(HIC "$N" HIC "弹起冬不拉，深情地唱道：在那遥"
                                     "远的地方，有位好姑娘。人们经过了她的毡房，总"
                                     "要把她深情地凝望。\n\n" NOR, me);

                        break;
                case 1:
        		message_sort(HIC "$N" HIC "弹起冬不拉，快乐地唱道：大坂城"
                                     "的石头圆又硬喽西瓜大又甜喽，大坂城的姑娘辫子"
                                     "长喽两只眼睛真漂亮。\n\n" NOR, me);

                        break;
                case 2:
        		message_sort(HIC "$N" HIC "弹起冬不拉，哀伤地唱道：戈壁滩"
                                     "上的一朵清泉冰山上的一朵雪莲。风暴不会永远不"
                                     "停，何时才能见到你的笑脸。\n\n" NOR, me);
                        break;
        }
        return 1;
}
