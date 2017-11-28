#include <ansi.h>

inherit ITEM;

void init()
{
        add_action("do_qufeng","qufeng");
}

void create()
{
        set_name("蜂浆瓶", ({ "fengjiang ping", "ping" }) );
        set_weight(4500);
        if( clonep() )
                set_default_object(__FILE__);
        else {
        set("unit", "个");
        set("value", 0);
        set("jian",5) ;
        set("material", "玉");
        set("long", "这是一个用上古美玉雕成的小瓶，还未拔开瓶塞，就可以闻到\n"
                    "一股浓郁的香味，可以用来驱蜂。\n") ;
        }
        setup();
}
int do_qufeng(string arg)
{
        object me, obj;
        int myexp , objexp ;
        int mylev , objlev ;
        int myforce , obforce ;
        int steps ;

        me = this_player();
        if (environment(me)->query("no_fight"))
                return notify_fail("这里禁止战斗。\n");

        if (! arg)
                return notify_fail("你想驱蜂攻击谁？\n");

        if (this_object()->query("jian") < 1)
                return notify_fail("小瓶里的玉蜂蜜已经给用光了。\n");

        if (! objectp(obj = present(arg, environment(me))))
                return notify_fail("这里没有这个人。\n");

        if (! obj->is_character() || obj->is_corpse())
                return notify_fail("看清楚一点，那并不是活物。\n");

        if (me->is_busy())
                return notify_fail("你现在正忙，没有时间驱蜂。\n");

        if (obj == me)
                return notify_fail("玉蜂不能攻击你。\n");

        if (! me->is_fighting(obj))
                return notify_fail("驱蜂只能在战斗中对对手使用。\n");

        myexp =  me->query ("combat_exp" );
        objexp = obj->query ("combat_exp" );
        mylev =  me->query_skill("qufeng" );
        objlev = obj->query_skill("qufeng" );
        myforce =  me->query_skill("force" );
        obforce = obj->query_skill("force" );

        if (mylev <= 0)
                return notify_fail("你不会驱蜂之术，不能驱使玉蜂为你攻击敌人！\n");

        myexp = 30 * objexp / myexp ;
        if (myexp < 30) myexp = 30 ;

        if ((int) me->query("jing") < myexp)
                return notify_fail("你的精不足以驱动玉蜂伤敌！\n");

        if (myforce + 15 <= obforce)
                return notify_fail("对手的内功太深厚了，驱蜂术对他不起作用！\n");

        this_object()->add("jian", -1);
        steps = (mylev - objlev) / 10;
        if (steps < 2) steps = 2 ;
        if (steps > 6) steps = 6 ;
        message_vision(HIY "$N" HIY "拔开玉瓶塞，手捂玉瓶潜运内力，使"
                       "得瓶中的香气远远飘了开去，\n突然嗡嗡之声大作，"
                       "不知道从哪里飞来一大群玉蜂，向$n" HIY "围了过去。\n" NOR,
                       me, obj);
        me->start_busy(3);

        if (random(mylev) < objlev * 2 / 3)
                message_vision(YEL "但$n" YEL "撮唇一啸，玉蜂似乎听"
                               "懂了号令，远远避了开去。\n" NOR, me, obj);
        else
        {
                tell_object(obj, HIR "你周围刹那间尽是玉蜂围绕，一只只玉蜂悍不畏死地向你\n"
                                 "蜇了过来，你只觉得背心微微一痛，已被玉蜂蜇中！\n" NOR  ) ;
                obj->receive_damage("jing", steps * 5, me);
                obj->receive_damage("qi", steps * 6, me);
                if (! obj->is_busy()) obj->start_busy(3);
                me->start_busy(1);
        }
        me->receive_damage("jing", myexp);
        return 1;
}
