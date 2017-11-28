// drink.c

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        string from;
        object from_ob;
        object ob;
        object *guard;
        int search_flag;
//      string prefix;
        int need_busy;

        if (! arg)
                return notify_fail("你要喝什么东西？\n");

        if (sscanf(arg, "%s in %s", arg, from) == 2)
        {
                // 检查容具
                if (sscanf(from, "all %s", from))
                {
                        if (me->is_busy())
                                return notify_fail("你忙着呢，没有功夫找东西。\n");

                        search_flag = 0;
                        foreach (from_ob in all_inventory(me))
                        {
                                if (! from_ob->id(from))
                                        continue;

                                if (from_ob->is_character())
                                        continue;

                                if (! present(arg, from_ob))
                                        continue;

                                search_flag = 1;
                                break;
                        }

                        if (! search_flag)
                        {
                                me->start_busy(2);
                                return notify_fail("你翻遍了身上带的东西，也没找到想要的。\n");
                        } else
                                need_busy = 3;
                } else
                if (! objectp(from_ob = present(from, me)))
                {
                        from_ob = present(from, environment(me));
                        if (me->query("env/careful"))
                        {
                                if (! objectp(from_ob))
                                        return notify_fail("你身上没有这个容具。\n");
                                else
                                        return notify_fail("你身上没有这样容具，附近的" +
                                                           from_ob->name() + "你又不敢动。\n");
                        }
        
                        if (! objectp(from_ob))
                                return notify_fail("你身上没有这样容具，附近也没有。\n");
                }

                if (from_ob->is_character() && from_ob != me)
                        return notify_fail("你要抢劫啊？\n");
                else
                if (sizeof(all_inventory(from_ob)) < 1)
                        return notify_fail(from_ob->name() + "里面什么都没有啊。\n");
        } else
                from_ob = me;

        if (! objectp(ob = present(arg, from_ob)))
        {
                ob = present(arg, environment(me));
                if (me->query("env/careful"))
                {
                        if (! objectp(ob))
                                return notify_fail("你身上没有这样东西。\n");
                        else
                                return notify_fail("你身上没有这样东西，附近的" +
                                                   ob->name() + "你又不敢动。\n");
                }

                if (! objectp(ob))
                        return notify_fail("你身上没有这样东西，附近也没有。\n");
        }

        if (me->is_busy())
        {
                write("你上一个动作还没有完成。\n");
                return 1;
        }

        if (guard = ob->query_temp("guarded"))
        {
                guard = filter_array(guard, (:
                        objectp($1) && present($1, environment($(me))) &&
                        living($1) && ($1 != $(me)) :));
                if (sizeof(guard))
                        return notify_fail(guard[0]->name()
                                + "正守在" + ob->name() + "一旁，防止任何人拿走。\n");
        }

        if (ob->query("only_do_effect"))
        {
                if (! ob->query("can_drink"))
                {
                        write(ob->name() + "怎么喝？\n");
                        return 1;
                }

                return ob->do_effect(me);
        }

        if (! mapp(ob->query("liquid")))
                return notify_fail("你不知道怎么喝" + ob->name() + "... :)\n");

        if (me->is_fighting())
        {
                write("你边打架边喝东西也不怕呛着？\n");
                return 1;
        }

        if (! ob->query("liquid/remaining"))
        {
                write(ob->name() + (ob->query("liquid/name") ?
                      "里的" + ob->query("liquid/name") + "已经被喝得一滴也不剩了。\n" :
                      "是空的。\n"));
                if (me->query("env/auto_drinkout") &&
                    environment(ob) != environment(me))
                {
                        message_vision("$N丢下一个$n。\n", me, ob);
                        ob->move(environment(me));
                }
                return 1;
        }

        if ((int)me->query("water") > me->max_water_capacity())
        {
                write("你已经喝太多了，再也灌不下一滴水了。\n");
                return 1;
        }

        ob->add("liquid/remaining", -1);
        message_vision("$N拿起" + ob->name() + "咕噜噜地喝了几口" +
                       ob->query("liquid/name") + "。\n", me);
        me->add("water", 30);

        ob->do_effect();
        if (! ob->query("liquid/remaining"))
        {
                write("你已经将" + ob->name() + "里的" + ob->query("liquid/name")
                        + "喝得一滴也不剩了。\n");
                ob->clear_effect();
                if (me->query("env/auto_drinkout") &&
                    environment(ob) == me)
                {
                        message_vision("$N丢下一个$n。\n", me, ob);
                        ob->move(environment(me));
                }
                return 1;
        }

        switch (ob->query("liquid/type"))
        {
        case "alcohol":
                me->apply_condition("drunk",
                        (int)me->query_condition("drunk") +
                        (int)ob->query("liquid/drunk_apply"));
                break;
        }

        if (! me->is_busy() && need_busy)
                me->start_busy(need_busy);
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : drink <容器> [in [all] <包裹>]
 
这个指令可以让你喝容器里面的液体。如果你没有设置变量 careful，
并且你身上没有带这种容器就会自动在周围的环境寻找你指定的容器。

如果你指明了 in， 那么你将从包裹取出容器饮用。倘若你身上没有
指明的包裹并且没有设置环境变量 careful 的话， 就会自动在附近
的环境寻找。

如果你指明了 all，那么你将在身上所有指定的包裹中寻找想要的容
器，这需要花费你一段时间。

see also : eat

HELP );
        return 1;
}