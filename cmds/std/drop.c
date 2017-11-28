// drop.c

#include <config.h>

inherit F_CLEAN_UP;

int do_drop(object me, object obj, int raw);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object obj, *inv, obj2;
        int i, amount;
        mixed info;
        string item;

        if (! arg)
                return notify_fail("你要丢下什么东西？\n");

        if (sscanf(arg, "%d %s", amount, item) == 2)
        {
                if (! objectp(obj = present(item, me)))
                        return notify_fail("你身上没有这样东西。\n");

                if (info = obj->query("no_drop"))
                        return notify_fail(stringp(info) ? info : "这样东西不能丢弃。\n");

                if (! obj->query_amount())
                        return notify_fail( obj->name() + "不能被分开丢弃。\n");

                if (amount < 1)
                        return notify_fail("东西的数量至少是一个。\n");

                if (amount > obj->query_amount())
                        return notify_fail("你没有那么多的" + obj->name() + "。\n");
                else if (amount == (int)obj->query_amount())
                        return do_drop(me, obj, 0);
                else
                {
                        obj->set_amount((int)obj->query_amount() - amount);
                        obj2 = new(base_name(obj));
                        obj2->set_amount(amount);
                        if (! do_drop(me, obj2, 0))
                        {
                                obj2->move(me);
                                return 0;
                        }
                        return 1;
                }
        }

        if (arg == "all")
        {
                inv = all_inventory(me);
                for(amount = 0, i = 0; i < sizeof(inv); i++)
                {
                        if (! living(me)) break;
                        amount += do_drop(me, inv[i], 1);
                }

                if (! amount)
                {
                        write("你什么都没有丢掉。\n");
                        return 1;
                }

                message("vision", me->name() + "丢下了一堆东西。\n",
                        environment(me), ({ me }));
                write("丢完了。\n");
                return 1;
        }

        if (! objectp(obj = present(arg, me)))
                return notify_fail("你身上没有这样东西。\n");

        do_drop(me, obj, 0);
        return 1;
}

int do_drop(object me, object obj, int raw)
{
        mixed no_drop;
        object riding;

        if (obj == (riding = me->query_temp("is_riding")))
        {
                message_vision("$N从$n背上飞身跳下。\n", me, riding);
                me->delete_temp("is_riding");
                obj->delete_temp("is_rided_by");
                obj->move(environment(me));
                return 1;
        }
        if (obj->is_depot_ob())
        {
                tell_object(me, obj->name() + "你也舍得丢弃？\n");
                return 0;
        }
        if (no_drop = obj->query("no_drop"))
                return notify_fail(stringp(no_drop) ? no_drop : "这样东西不能随意丢弃。\n");

        if (no_drop = environment(me)->query("no_drop"))
                return notify_fail(stringp(no_drop) ? no_drop : "这里东西丢弃下去也看不见。\n");

        switch ((string)obj->query("equipped"))
        {
        case "worn":
                tell_object(me, obj->name() + "必须脱下来才能丢掉。\n");
                return 0;

        case "wielded":
                tell_object(me, obj->name() + "必须解除装备才能丢掉。\n");
                return 0;
        }

        if (! obj->is_character() &&
            ! obj->can_combine_to(environment(me)) &&
            sizeof(filter_array(all_inventory(environment(me)),
                                (: ! $1->is_character() :))) > MAX_ITEM_IN_ROOM)
        {
                tell_object(me, "这里东西太多了，你乱丢恐怕" + obj->name() + "就找不到了。\n");
                return 0;
        }

        if (obj->move(environment(me)))
        {
                if (obj->is_character() && obj->query_weight() > 20000)
                        message_vision("$N将$n从背上放了下来，躺在地上。\n", me, obj);
                else
                {
                        if (! raw)
                                message_vision(sprintf("$N丢下一%s$n。\n",
                                                       obj->query("unit")), me, obj);
                        else
                                write("你丢下了一" + obj->query("unit") +
                                      obj->name() + "\n");

                        if (! obj->is_character() && ! obj->query("value") && ! obj->value())
                        {
                                write("因为这样东西并不值钱，所以人们并不会注意到它的存在。\n");
                                destruct(obj);
                        }
                }
                return 1;
        }

        return 0;
}

int help(object me)
{
        write(@HELP
指令格式 : drop <物品名称> | all
 
这个指令可以让你丢下你所携带的物品.
 
HELP );
        return 1;
}
