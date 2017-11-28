#include <ansi.h> 
inherit ROOM;

void create ()
{
        set ("short", "练武场");
        set ("long", @LONG
空阔的场地上铺满了细细的黄土，正好适合演武。四面有几个镖局的镖师
正在练武。树荫里，一位管家打扮的人正在背着手观看，还不时走上前去指点
一二。场地边上挂着几个大沙袋(shadai)，不知有什么用处。
LONG);

        set("item_desc", ([
                "shadai" : WHT "几个沉重的沙袋，可以试着打打(jida)看。\n" NOR,
        ]));

        set("exits", ([
                "out"   : __DIR__"gate",
                "north" : __DIR__"front_yard2",
                "east"  : __DIR__"majuan",
                "west"  : __DIR__"zhangfang",
        ]));

        setup();
}

void init()
{
  	add_action("do_jida", "jida");
}

int do_jida(string arg)
{
        object me;
        object weapon;
        me = this_player();

        if (! living(me) || arg != "shadai")
                return notify_fail("你要击打什么？\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着。\n");

        if (objectp(weapon = me->query_temp("weapon")))
                return notify_fail(WHT "你操起手中兵器向沙袋砍去，“哧”的一声沙袋应"
                                   "声而破，里面的沙流了一地。\n" NOR);

        if ((int)me->query_skill("cuff", 1) < 30
           || (int)me->query_skill("strike", 1) < 30)
                return notify_fail("你击打半天，手都打出茧了，可还是什么都没学到，可"
                                   "能是拳掌等级太低的缘故。\n");

        if ((int)me->query_skill("cuff", 1) >= 120
           && (int)me->query_skill("strike", 1) >= 120)
                return notify_fail("你对着沙袋击打了一会儿，发现这里已经不能再提高什"
                                   "么了。\n");

        if ((int)me->query("qi") < 40)
                return notify_fail("你现在累得胳膊都抬不起来了，先休息一会儿吧。\n");

        me->receive_damage("qi", 30);

        if (me->can_improve_skill("cuff")
           && (int)me->query_skill("cuff", 1) < 120)
                me->improve_skill("cuff", me->query("con") * 2);

        if (me->can_improve_skill("strike")
           && (int)me->query_skill("strike", 1) < 120)
                me->improve_skill("strike", me->query("con") * 2);

        me->start_busy(random(2));
        message_vision(WHT "\n$N" WHT "站稳马步，一掌一拳对着沙袋打了起来。\n" NOR, me);
        write(HIC "你在击打过程中领悟了不少「基本拳法」及「基本掌法」的窍门。\n" NOR);
        return 1;
}
