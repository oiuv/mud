#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "鄂鱼潭岸上");
        set("long", @LONG
鄂鱼潭深处地底，寒似冰窟。潭中(tan)一团黑子晃动，仔
细一看竟是许多凶猛的鄂鱼。 只见不远处似有一个洞口，但由
于深潭相隔，不知如何过去。

LONG);
        set("item_desc",([
               "tan" : HIC "潭中鄂鱼成群，凶猛无比。 恐怕只有"
                       "施展轻功穿(cross)过去了。\n" NOR,
        ]));

        set("no_clean_up", 0);

        setup();

}

void init()
{       
        add_action("do_cross", ({ "cross" }));
}

int do_cross(string arg)
{
        object me = this_player();
        object ob1, ob2, ob3;
        int n;
        string msg;

        if (! arg || arg != "tan" )
                return notify_fail("你要往哪儿跳？\n");

        // ob1 鄂鱼潭岸上
        if (! ob1 = find_object(__DIR__"eyutan1"))
                ob1 = load_object(__DIR__"eyutan1");

        // 若轻功不济则掉如潭水中,   ob2 深潭
        if (! ob2 = find_object(__DIR__"eyutan2"))
                ob2 = load_object(__DIR__"eyutan2");

        // ob3 鄂鱼潭对岸
        if (! ob3 = find_object(__DIR__"eyutan3"))
                ob3 = load_object(__DIR__"eyutan3");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢！\n");

        if (me->is_fighting())
                return notify_fail("你还是先把你面前这个家伙解决了再说。\n");

        n = me->query_skill("dodge");
        
        if (n > 120)
        {   
            msg = HIY + me->name() + HIY "飞身前跃，跳向鄂鱼潭，只见" + me->name() +
                  HIY "到至深潭上空却又忽地落下，眼见要坠入潭中。却见" + me->name() +
                  HIY "双足在鄂鱼背上一点，顷刻间腾向对岸。\n" NOR;
                      
            tell_room(ob1, sort_msg(msg), me);

            tell_object(me,  HIC "你飞身前跃，跳至深潭半空身双足在鄂鱼背上一点，眨"
                             "眼间已\n到得对岸。\n\n" NOR);

            tell_room(ob3, HIG + me->name() + HIG "从对岸跳了过来。\n" NOR, me);
        
            me->move(ob3);
        }     
        else
        {
            msg = HIR + me->name() + HIR "飞身前跃，跳向鄂鱼潭，只见" + me->name() +
                  HIR "到至深潭上空却力气已尽，落入潭中。\n" NOR;

            tell_room(ob1, sort_msg(msg), me);

            tell_object(me,  HIR "你飞身前跃，跳至深潭半空身却感觉力气已尽，想回头"
                            "已不能，\n只听“扑咚”一声，你已经落入深潭之中。\n\n" NOR);
             
            me->move(ob2);
        } 

        return 1;
}


