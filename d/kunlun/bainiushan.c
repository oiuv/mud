#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "白牛山");
        set("long",@long
这座山因终年覆盖白雪，且形状远望如一头正在吃草的牛
而得名。这里寒风呼啸，凛冽刺骨，你不禁打了个寒颤。山顶
有一处平地，放有一块青色的巨石(stone)。
long);
        set("exits",([
                "southwest" : __DIR__"fufengshan",
        ]));

        set("item_desc", ([
                "stone" : WHT "这块巨石很大，可以卧(wo)下"
                          "一个人。巨石的表面十分平整光\n"
                          "滑，似乎常有人摩挲一般。\n" NOR,
        ]));

        set("outdoors", "kunlun");
        setup();
}

void init()
{
        add_action("do_wo", "wo");
        add_action("do_breathe", "breathe");
}

int do_wo(string arg)
{
        if (! arg || (arg != "stone") )
                return notify_fail("你要卧在什么上面？\n");

        if (this_player()->is_busy())
                return notify_fail("你正忙着呢。\n");

        if (this_player()->query_temp("marks/wo"))
                return notify_fail("你已经躺在青石上了。\n");

        this_player()->set_temp("marks/wo", 1);
                return notify_fail(HIC "你侧身躺于青石上，意守丹田，口眼轻闭，双腿自"
                                   "然微曲，全身放松。\n" NOR);
}

int do_breathe()
{
        object me = this_player();

        if (! me->query_temp("marks/wo") )
                return notify_fail(HIR "你深深吸了几口气，只觉得寒气冲进五脏六腑，体"
                                   "内的真气几乎提不起来。\n" NOR);

        if (me->is_busy())
                return notify_fail("你正忙着呢。\n");

        if (me->query_temp("marks/done") )
                return notify_fail(HIC "寒风凛冽，你刚运过功，身子正十分虚弱，先好好"
                                   "休息一下吧。\n" NOR);

        if (me->query_skill("liangyi-shengong", 1) < 120 )
                return notify_fail("你内功基底太弱，不可以随意控制内息。\n");

        if (me->query_skill("liangyi-shengong", 1) > 199 )
                return notify_fail("你的两仪神功已经很强了，无法再通过吐纳来增强功力。\n");

        if (! me->can_improve_skill("liangyi-shengong"))
                return notify_fail("你的实战经验不足，无法继续吐纳练功。\n");

        if (me->query("qi") < 40 || me->query("jing") < 40)
                return notify_fail("你现在已经很疲倦了，休息一下再来吧息。\n");

        message_vision(HIW "\n$N" HIW "集聚体内的两仪真气，深深吸进几口气，又缓缓的将"
                       "其呼出\n体外。$N" HIW "只觉得全身透彻清凉心定似水，仿佛已物我"
                       "浑然一体。\n\n" NOR, me);

        me->receive_damage("jing", random(30));
        me->receive_damage("qi",   random(30));
        if (me->can_improve_skill("liangyi-shengong"))
/*
                me->improve_skill("liangyi-shengong", 5 + me->query("con") / 3 +
                                  me->query_skill("force") / 6);
*/
                me->improve_skill("liangyi-shengong", 10 + me->query_con() * 5 +
                                  me->query_skill("force") / 2);
        me->set_temp("marks/done", 1);
        call_out("delete_done", 5, me);

        return 1;
}

void delete_done(object me)
{
        if (objectp(me)) me->delete_temp("marks/done");
}

int valid_leave(object me, string dir)
{
        me->delete_temp("marks/wo");
                return ::valid_leave(me, dir);
}
