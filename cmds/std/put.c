
inherit F_CLEAN_UP;

int do_put(object me, object obj, object dest);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        string target, item;
        object obj, dest, *inv, obj2;
        int i, amount;

        if (! arg) return notify_fail("你要将什么东西放进哪里？\n");

        if (sscanf(arg, "%s in %s", item, target) != 2)
                return notify_fail("你要放什么东西？\n");

        dest = present(target, me);
        if (! dest || living(dest))
                dest = present(target, environment(me));

        if (! dest || living(dest))
                return notify_fail("这里没有这样东西。\n");

        if (dest->query("no_get_from"))
                return notify_fail("还是不要打扰人家了。\n");

        if (sscanf(item, "%d %s", amount, item) == 2)
        {
                if (! objectp(obj = present(item, me)))
                        return notify_fail("你身上没有这样东西。\n");

                if (! obj->query_amount())
                        return notify_fail( obj->name() + "不能被分开。\n");

                if (amount < 1)
                        return notify_fail("东西的数量至少是一个。\n");

                if (amount > obj->query_amount())
                        return notify_fail("你没有那么多的" + obj->name() + "。\n");
                else
                if (amount == (int) obj->query_amount())
                        return do_put(me, obj, dest);
                else
                {
                        obj->set_amount((int) obj->query_amount() - amount);
                        obj2 = new(base_name(obj));
                        obj2->set_amount(amount);
                        return do_put(me, obj2, dest);
                }
        }

        if (item == "all")
        {
                inv = all_inventory(me);
                for(i=0; i<sizeof(inv); i++)
                        if (inv[i] != dest)
                                do_put(me, inv[i], dest);
                write("Ok.\n");
                return 1;
        }

        if (! objectp(obj = present(item, me)))
                return notify_fail("你身上没有这样东西。\n");
        return do_put(me, obj, dest);
}

int do_put(object me, object obj, object dest)
{
        mixed msg;

        if (dest->is_depot_ob())
        {
                tell_object(me, "存东西到" + dest->name() + "的快捷方式：store 物品ID。\n");
                return 1;
        }

        if (! dest->is_container() && ! dest->is_character())
        {
                tell_object(me, dest->name() + "不是容器，你不能把东西放进去。\n");
                return 1;
        }

        if (sizeof(all_inventory(dest)) >= MAX_ITEM_CARRIED)
        {
                tell_object(me, dest->name() + "里面的东西实在"
                            "是太多了，你没法再放东西了。\n");
                return 1;
        }

        if (! undefinedp(msg = obj->query("no_put")))
        {
                if (stringp(msg))
                        tell_object(me, msg);
                else
                        tell_object(me, "这个东西不要乱放。\n");
                return 1;
        }

        if (obj->is_corpse())
        {
                tell_object(me, "你无法把" + obj->name() + "塞进去。\n");
                return 1;
        }

        if (userp(obj))
        {
                tell_object(me, "你无法把" + obj->name() + "塞进去。\n");
                return 1;
        }

        if (obj == dest)
        {
                tell_object(me, "嗯... 自己套自己，你的想法比较有趣。\n");
                return 1;
        }

        if (obj->move(dest))
        {
                message_vision(sprintf("$N将一%s%s放进%s。\n",
                               obj->query("unit"), obj->name(),
                               dest->name()), me);
                return 1;
        }

        // 放回到我的身上来
        if (! environment(obj))
                // 这是分离的物品，没有分离成功
                obj->move(me, 1);

        return 0;
}

int help(object me)
{
write(@HELP
指令格式 : put <物品名称> in <某容器>
 
这个指令可以让你将某样物品放进一个容器，当然，首先你要拥有这样物品。
 
HELP
    );
    return 1;
}
