// guard.c

inherit F_CLEAN_UP;

mapping default_dirs = ([
        "north":        "北",
        "south":        "南",
        "east":         "东",
        "west":         "西",
        "northup":      "北边",
        "southup":      "南边",
        "eastup":       "东边",
        "westup":       "西边",
        "northdown":    "北边",
        "southdown":    "南边",
        "eastdown":     "东边",
        "westdown":     "西边",
        "northeast":    "东北",
        "northwest":    "西北",
        "southeast":    "东南",
        "southwest":    "西南",
        "up":           "上",
        "down":         "下",
        "out":          "外",
        "in" :          "里",
        "enter" :       "里面",
]);

int main(object me, string arg)
{
//      string dir;
        object ob, *guards;
        object env;
        mixed old_target;

        if (me->is_busy() || me->is_fighting())
                return notify_fail("你现在没有办法分心去做这类事！\n");

        old_target = me->query_temp("guardfor");

        if (! arg || arg == "")
        {
                if (objectp(old_target))
                        if (living(old_target))
                                write("你正在守护著" + old_target->name() +
                                      "。\n");
                        else
                                write("你正守在" + old_target->name() +
                                      "一旁，防止别人拿走。\n");
                else
                if (stringp(old_target))
                        write("你正守住往" + default_dirs[old_target] +
                              "的方向，不准任何人离开。\n");
                else
                        return notify_fail("指令格式：guard <生物> | "
                                           "<物品> | <方向>\n");

                return 1;
        }

        env = environment(me);
        ob = present(arg, env);

        if (ob)
        {
                if (ob == me)
                        return notify_fail("守卫自己？不用说你也会"
                                           "做，对吧。\n");
                if (me->query("jing") * 100 / me->query("max_jing") < 60)
                        return notify_fail("你现在无法集中精神守卫" + ob->name() + "。\n");
                me->set_temp("guardfor", ob);
        } else
        if (env->query("exits/" + arg))
        {
                if (env->query("no_fight"))
                        return notify_fail("这里不准战斗——也不准堵住别人去路！\n");
                if (me->query("jing") * 100 / me->query("max_jing") < 75)
                        return notify_fail("你现在无法集中精神守卫这个方向。\n");
                me->set_temp("guardfor", arg);
        } else
        if (arg != "cancel")
                return notify_fail("你要守卫谁，什麽，或是哪个方向？\n");

        if (objectp(old_target))
        {
                if (arrayp(guards = old_target->query_temp("guarded")))
                {
                        guards -= ({ me, 0 });
                        if (! sizeof(guards))
                        {
                                old_target->delete_temp("guarded");
                        } else
                                old_target->set_temp("guarded", guards);
                }
                if (interactive(old_target))
                        tell_object(old_target, me->name() +
                                    "不再保护你了。\n");
        } else
        if (stringp(old_target))
        {
                guards = env->query_temp("guarded/" + old_target);
                if (arrayp(guards))
                {
                        guards -= ({ me, 0 });
                        if (! sizeof(guards))
                        {
                                env->delete_temp("guarded/" + old_target);
                        } else
                                env->set_temp("guarded/" + old_target, guards);
                }
        }
        me->delete_temp("guardfor");

        if (arg=="cancel")
        {
                write("什么也不用守了，真是好轻松。\n");
                return 1;
        }

        if (objectp(ob))
        {
                guards = ob->query_temp("guarded");
                if (! arrayp(guards))
                        guards = ({ me });
                else
                {
                        guards -= ({ 0 });
                        guards += ({ me });
                }
                ob->set_temp("guarded", guards);
                if (living(ob))
                        message_vision("$N开始保护$n。\n", me, ob);
                else
                        message_vision("$N站到地上的$n一旁守著，以"
                                       "免别人取走。\n", me, ob);
                me->set_temp("guardfor", ob);
        } else
        {
                guards = env->query_temp("guarded/" + arg);
                if (! arrayp(guards))
                        guards = ({ me });
                else
                {
                        guards -= ({ 0 });
                        guards += ({ me });
                }
                env->set_temp("guarded/" + arg, guards);
                message("vision", me->name() + "鬼鬼祟祟的望了望四周，"
                                  "不知道要干什么。\n", env, ({ me }));
                tell_object(me, "你开始守住往" + default_dirs[arg] +
                               "的方向不让任何人通行。\n", me);
                me->set_temp("guardfor", arg);
        }

        return 1;
}

int help(object me)
{
        write(@TEXT
指令格式：guard [<某人>|<地上某物>|<某个出口>|cancel]

这个指令有三种作用方式，分别如後：

guard <某人>      保护<某人>，当他／她受到攻击时，保护者会自
                  动加入战斗。

guard <地上某物>  守住放在地上的某件东西，防止别人来拿，只要
                  你还在这个房间，而且没有忙著其他事，别人就
                  无法拿走这件东西。

guard <某个出口>  守住某个出口防止所有人从这个出口离开，可以
                  用来阻拦善於逃跑的敌人或拦路打劫做坏事，如
                  果你当时正忙，则不能阻挡别人。

guard cancel      取消先前的 guard 对象。

注意，只要你一移动，对物品和出口的守卫状态就会解除，但是对人
物的保护状态仍然有效，只要你到了保护对象的身边仍然发挥作用。
另外，当你在守卫状态的时候，会消耗精，如果精不够了，则会自动
解除守卫状态。
TEXT);
        return 1;
}