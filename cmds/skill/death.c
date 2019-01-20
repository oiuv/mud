// animaout.c

#include <ansi.h>

inherit F_CLEAN_UP;

int outing(object me);
int halt_outing(object me);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
//      int exercise_cost;
        object where;

        seteuid(getuid());
        where = environment(me);

       // if( !query("animaout", me) )
       if(! me->query("animaout"))
                return notify_fail("你还没有练成元婴出世，谈什么生死玄关？\n");

       // if( query("death", me) )
       if (me->query("death"))
                return notify_fail("你已经打通生死玄关了，没有必要再来一遍！\n");

       // if( !query("no_fight", where) )
       if (! where->query("no_fight"))
                return notify_fail("在这里打通生死玄关？不太安全吧？\n");

       // if( !query("sleep_room", where) )
       if (! where->query("sleep_room"))
                return notify_fail("你得找一个能够休息的地方闭关修行。\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

       // if( query("potential", me)-query("learned_points", me)<1000 )
       if (me->query("potential") - me->query("learned_points") < 1000)
                return notify_fail("你的潜能不够，没法闭关修行以打通生死玄关。\n");

       // if( query("qi", me)*100/query("max_qi", me)<90 )
       if ((int)me->query("qi") * 100 / me->query("max_qi") < 90)
                return notify_fail("你现在的气太少了，无法静心闭关。\n");

      //  if( query("jing", me)*100/query("max_jing", me)<90 )
      if ((int)me->query("jing") * 100 / me->query("max_jing") < 90)
                return notify_fail("你现在的精太少了，无法静心闭关。\n");

      //  if( query("max_jingli", me)<2000 )
      if ((int)me->query("max_jingli") < 2000)
                return notify_fail("你觉得精力颇有不足，看来目前还难以"
                                   "打通生死玄关。\n");

      //  if( query("jingli", me)*100/query("max_jingli", me)<90 )
      if ((int)me->query("jingli") * 100 / me->query("max_jingli") < 90)
                return notify_fail("你现在的精力太少了，无法静心闭关。\n");

        message_vision("$N盘膝坐下，开始冥神运功，闭关修行。\n", me);
       // set("startroom", base_name(where), me);
       // set("doing", "death", me);
       me->set("startroom", base_name(where));
        me->set("doing", "death");
        CLOSE_D->user_closed(me);
        me->start_busy(bind((:call_other, __FILE__, "outing" :), me),
                       bind((:call_other, __FILE__, "halt_outing" :), me));
        CHANNEL_D->do_channel(this_object(), "rumor",
                              sprintf("%s%s(%s)开始闭关修行，试图打通生死玄关。",
                              ultrap(me) ? "大宗师" : "",
                              me->name(1),me->query("id")));

        return 1;
}

int continue_outing(object me)
{
        me->start_busy(bind((:call_other, __FILE__, "outing" :), me),
                       bind((:call_other, __FILE__, "halt_outing" :), me));
        CLOSE_D->user_closed(me);
        tell_object(me, HIR "\n你继续闭关修行试图打通生死玄关...\n" NOR);
        return 1;
}

private void stop_outing(object me)
{
        CLOSE_D->user_opened(me);
        if (! interactive(me))
        {
                me->force_me("chat* sigh");
                call_out("user_quit", 0, me);
        }
}

int outing(object me)
{
        string msg;

      //  if( query("potential", me) <= query("learned_points", me) )
      if (me->query("potential") <= me->query("learned_points"))
        {
                tell_object(me, "你没有办法继续下去了。\n");
                message_vision("$N睁开双目，缓缓吐了一口气，站了起来。\n", me);
                CLOSE_D->user_opened(me);
                CHANNEL_D->do_channel(this_object(), "rumor",
                                      sprintf("听说%s(%s)闭关结束，似乎没有什么成果。",
                                      me->name(1),me->query("id")));
                if (! interactive(me))
                {
                        me->force_me("chat* sigh");
                        call_out("user_quit", 0, me);
                }

                return 0;
        }

        //addn("learned_points", 1, me);
        me->add("learned_points", 1);

        if (random(10))
                return 1;

        //if( random(100000)<query("con", me) )
        if (random(40000) < me->query("int"))
        {
                message_vision(HIY "只见$N" HIY "头上现出万朵金莲，光"
                               "华四射，一时间麝香扑鼻、氤氲遍地！\n" NOR, me);
                tell_object(me, HIM "你觉得精力源源而生，忽然心如止水，如身出"
                            "天际，无源无尽、登时大彻大悟。\n" NOR);

               // set("death", 1, me);
               me->set("death", 1);
                CHANNEL_D->do_channel(this_object(), "rumor",
                                      sprintf("听说%s(%s)经过闭关苦修，终"
                                      "于参悟出生死之道，打通了生死玄关。",
                                      me->name(1),me->query("id")));

                CHAR_D->setup_char(me);
                stop_outing(me);
                return 0;
        }

        switch (random(4))
        {
        case 0:
                msg = "你闭目凝神，试图进入无我境界。\n";
                break;

        case 1:
                msg = "你试图将元神与肢体分离，然后参悟生死之道。\n";
                break;

        case 2:
                msg = "你试图将元神逼出七窍，然后周游四处复又收回。\n";
                break;

        default:
                msg = "你缓缓呼吸吐纳，将空气中水露皆收为己用。\n";
                break;
        }

        tell_object(me, msg);
        return 1;
}

int halt_outing(object me)
{
        CLOSE_D->user_opened(me);
        tell_object(me, "你中止了闭关。\n");
        message_vision(HIY "$N" HIY "轻轻叹了一口气，缓缓的睁开眼。\n\n" NOR, me);
       // addn("potential", (query("learned_points", me)-query("potential", me))/2, me);
       me->add("potential", (me->query("learned_points") - me->query("potential")) / 2);
        CHANNEL_D->do_channel(this_object(), "rumor", "听说" + me->name(1) +
                              "闭关中途突然复出。");
        return 1;
}

private void user_quit(object me)
{
        if (! me || interactive(me))
                return;

        me->force_me("quit");
}

int help(object me)
{
        write(@HELP
指令格式 : death

当你修炼元婴出世以后，并且具有非常高深的精力修为时，可以用
这条指令打通生死玄关。打通生死玄关后可以使你死亡后有几率不
损失武功技能。

HELP );
        return 1;
}