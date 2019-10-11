// eat.c

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        int count;
        string from;
        object from_ob;
        object ob;
        object *guard;
        int search_flag;
        string prefix;
        int need_busy;

        if (! arg)
                return notify_fail("你要吃什么东西？\n");

        prefix = "";
        need_busy = 0;
        if (sscanf(arg, "%s in %s", arg, from) == 2)
        {
                // 检查容容具
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

                prefix = "从" + from_ob->name() + "中";
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

        if (! undefinedp(count = ob->query_amount()) && count < 1)
                return notify_fail(ob->name() + "已经吃完了。\n");

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
                return ob->do_effect(me);
        } else
        {
                if (! ob->query("food_remaining"))
                        return notify_fail(ob->name() + "已经没什么好吃的了。\n");

                if (me->is_fighting())
                {
                        write("你边打架边吃东西也不怕弄坏了胃！\n");
                        return 1;
                }
 
                if (ob->query("material") == "plant")
                {
                        message_vision("$N把$n塞进嘴里，嚼了几口吞下肚。\n",
                                       me, ob);
                        destruct(ob);
                        return 1;
                }

                if ((int)me->query("food") > (int)me->max_food_capacity())
                {
                        write("你已经吃太饱了，再也塞不下任何东西了。\n");
                        return 1;
                }
        
                me->add("food", ob->query("food_supply"));
        
                ob->set("base_value", 0);
                ob->add("food_remaining", -1);
                ob->do_effect(me);
                if (ob->query("food_remaining") < 1)
                {
                        message_vision("$N将剩下的" + ob->name() + "吃得干干净净。\n", me);
                        ob->clear_effect();
                        if (! ob->finish_eat())
                                destruct(ob);
                } else 
                {
                        message_vision("$N" + prefix + "拿出" +
                                       ob->name() + "咬了几口。\n", me);
                }
        }

        if (! me->is_busy() && need_busy)
                me->start_busy(need_busy);
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : eat <食物> | <丹药> [in [all] <包裹>]
 
这个指令可以让你吃食物。如果你没有设置环境变量 careful，并且
你身上没有带这种食物就会自动在周围的环境寻找你指定的食物。

如果你指明了 in， 那么你将从包裹取出食物食用。倘若你身上没有
指明的包裹并且没有设置环境变量 careful 的话， 就会自动在附近
的环境寻找。

如果你指明了 all，那么你将在身上所有指定的包裹中寻找想要的食
物，这需要花费你一些时间。

see also : drink
 
HELP );
        return 1;
}
