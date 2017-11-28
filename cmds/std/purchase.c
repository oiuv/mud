// purchase.c

#include <ansi.h>

inherit F_CLEAN_UP;

int do_purchase(object me, string from, string item, int count, string money);

mapping items = ([
        "sword"    : "/clone/weapon/changjian",
        "blade"    : "/clone/weapon/gangdao",
        "staff"    : "/clone/weapon/gangzhang",
        "club"     : "/clone/weapon/tiegun",
        "hammer"   : "/clone/weapon/hammer",
        "dagger"   : "/clone/weapon/dagger",
        "pin"      : "/clone/misc/pin",
        "whip"     : "/clone/weapon/changbian",
        "throwing" : "/clone/weapon/tielianzi",
]);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        string item;
        object ob;
        string from;
        int    count;
        string money;

        if (! arg)
                return notify_fail("你打算购买什么？\n");

        if (sscanf(arg, "%s from %s with %d %s", item, from, count, money) == 4)
                return do_purchase(me, from, item, count, money);

        if (sscanf(arg, "%*s from %*s") == 2)
                return notify_fail("你打算花多少钱？\n");

        if (arg == "cancel")
        {
                string target;
                object target_ob;

                if (! stringp(target = me->query_temp("pending/purchase")))
                        return notify_fail("你现在并没有打算和别人购买什么啊！\n");

                if (objectp(target_ob = present(target, environment(me))))
                        tell_object(target_ob,
                                    YEL + me->name(1) + "打消向你购买东西的念头。\n" NOR);
                tell_object(me, YEL "你打消了交易的念头。\n" NOR);
                me->delete_temp("pending/purchase");
                me->delete_temp("pending/info");
                return 1;
        }

        if (me->query("doing") != "scheme")
                return notify_fail("只有在计划中才能使用这条命令购买道具。\n");

        if (undefinedp(item = items[arg]))
                return notify_fail("现在没法购买这种道具。\n");

        if (me->is_busy())
                return notify_fail("你现在正忙，没空购买道具。\n");

        if (MONEY_D->player_pay(me, 10000 + item->value()) != 1)
                return notify_fail("你身上的钱不够，没法托人购买道具。\n");

        ob = new(item);
        message_vision("$N找了一个打杂的，让他帮助你购买" + item->name() + "。\n", me);
        ob->move(me, 1);
        write("你成功的买到了一" + ob->query("unit") + item->name() + "。\n");
        me->start_busy(20);
        return 1;
}

int do_purchase(object me, string from, string item, int count, string money)
{
        int     amount;
        object  from_ob;
        object  item_ob;
        object  money_ob;
        object* total_obs;
        int     total;
        int     combined;

        if (sscanf(item, "%d %s", amount, item) != 2)
                amount = 1;

        from_ob = present(from, environment(me));
        if (! objectp(from_ob))
                return notify_fail("这里没有这个人。\n");

        if (from_ob == me)
                return notify_fail("左手和右手做生意？好主意，不过这帮不了你练左右互搏。\n");

        if (! playerp(from_ob))
                return notify_fail("人家似乎懒得理你。\n");

        if (! interactive(from_ob))
                return notify_fail("人家现在没法和你答话。\n");

        if (me->query_temp("pending/purchase") == from_ob->query("id"))
                return notify_fail("你现在等别人回话呢。\n");

        item_ob = from_ob->query_temp("handing");
        if (! objectp(item_ob) || (item != "?" && ! item_ob->id(item)))
                return notify_fail("人家并没有亮出来这样东西。\n");

        if (item_ob->is_item_make())
                return notify_fail("这可是别人炼制的物品，不太妥吧。\n");

        if (item_ob->query("money_id"))
                return notify_fail("钱你也想买？\n");

        if (amount < 1)
                return notify_fail("你想买多少" + item_ob->query("units") +
                                   item_ob->name() + "？\n");

        if (! undefinedp(total = item_ob->query_amount()))
                combined = 1;
        else
        {
                string iname;

                iname = base_name(item_ob);
                total_obs = filter_array(all_inventory(from_ob),
                                         (: base_name($1) == $(iname) :));
                total = sizeof(total_obs);
                combined = 0;
        }

        if (amount > total)
                return notify_fail("人家身上没有那么多" + item_ob->name() + "啊！\n");

        if (count < 1)
                return notify_fail("你要出多少钱？\n");

        money_ob = present(money, me);
        if (! objectp(money_ob))
                return notify_fail("你身上并没有这种钱啊。\n");

        if (! money_ob->query("money_id"))
                return notify_fail("你想自己印钞票？\n");

        if (count > money_ob->query_amount())
                return notify_fail("你身上没那么多" + money_ob->name() + "。\n");

        message_vision("$N想用" + chinese_number(count) +
                    money_ob->query("base_unit") + money_ob->name() +
                    "向$n购买" + chinese_number(amount) +
                    (combined ? item_ob->query("base_unit") : item_ob->query("unit")) +
                    item_ob->name() + "。\n" NOR, me, from_ob);
        tell_object(from_ob, YEL "你同意(right)还是不同意(refuse)" + me->name(1) +
                             YEL "(" + me->query("id") + YEL ")的要求？\n" NOR);
        from_ob->set_temp("pending/answer/" + me->query("id") + "/right",
                          bind((: call_other, __FILE__, "do_right", from_ob, me :), from_ob));
        from_ob->set_temp("pending/answer/" + me->query("id") + "/refuse",
                          bind((: call_other, __FILE__, "do_refuse", from_ob, me :), from_ob));
        me->set_temp("pending/purchase", from_ob->query("id"));
        me->set_temp("pending/purchase_info",
                     ([ "item"   : base_name(item_ob),
                        "amount" : amount,
                        "money"  : money,
                        "count"  : count ]));
        tell_object(me, YEL + "你向" + from_ob->name(1) + "提出了要求。\n" NOR);
        return 1;
}

int do_refuse(object me, object ob)
{
        if (! objectp(ob))
                return notify_fail("这里没有人等你回话了。\n");

        if (ob->query_temp("pending/purchase") != me->query("id"))
                return notify_fail("人家已经不打算和你做买卖了。\n");

        ob->delete_temp("pending/purchase");
        tell_object(ob, me->name(1) + "对你道：“你想买，我倒不想卖，算了吧。”\n");
        tell_object(me, "你拒绝了" + ob->name(1) + "的要求。\n");
        return 1;
}

int do_right(object me, object ob)
{
        string  item;
        object  item_ob;
        int     amount;
        string  money;
        object  money_ob;
        int     count;
        object* total_obs;
        int     total;
        int     combined;
        object  temp_ob;

        if (! objectp(ob))
                return notify_fail("这里没有人等你回话了。\n");

        if (ob->query_temp("pending/purchase") != me->query("id"))
                return notify_fail("人家已经不打算和你做买卖了。\n");

        item   = ob->query_temp("pending/purchase_info/item");
        amount = ob->query_temp("pending/purchase_info/amount");
        money  = ob->query_temp("pending/purchase_info/money");
        count  = ob->query_temp("pending/purchase_info/count");
        ob->delete_temp("pending/purchase_info");
        ob->delete_temp("pending/purchase");

        if (! stringp(item))
        {
                tell_object(me, "你现在没有人家感兴趣的东西了。\n");
                tell_object(ob, "人家现在已经没有你感兴趣的东西了。\n");
                return 1;
        }

        foreach (item_ob in all_inventory(me))
                if (base_name(item_ob) == item)
                        break;

        if (base_name(item_ob) != item)
        {
                tell_object(me, "你现在没有人家感兴趣的东西了。\n");
                tell_object(ob, "人家现在已经没有你感兴趣的东西了。\n");
                return 1;
        }

        if (item_ob->query("money_id"))
                return notify_fail("钱你也想卖？\n");

        if (amount < 1)
        {
                tell_object(me, "你不知道人家究竟买多少" +
                                item_ob->name() + "。\n");
                tell_object(ob, "人家不清楚你究竟要买多少" +
                                item_ob->name() + "。\n");
                return 1;
        }

        if (! undefinedp(total = item_ob->query_amount()))
                combined = 1;
        else
        {
                string iname;

                iname = base_name(item_ob);
                total_obs = filter_array(all_inventory(me),
                                         (: base_name($1) == $(iname) :));
                total = sizeof(total_obs);
                combined = 0;
        }

        if (amount > total)
        {
                tell_object(me, "你现在身上没有那么多" + item_ob->name() + "了。\n");
                tell_object(ob, "人家现在身上没有那么多" + item_ob->name() + "了。\n");
                return 1;
        }

        if (count < 1)
        {
                tell_object(me, "你不知道人家想要出多少钱。\n");
                tell_object(ob, "人家不知道你想要出多少钱。\n");
                return 1;
        }

        if (! stringp(money) || ! objectp(money_ob = present(money, ob)) ||
            ! money_ob->query("money_id") || count > money_ob->query_amount())
        {
                tell_object(me, "人家现在身上没有钱了。\n");
                tell_object(ob, "人家同意了，可是你现在身上没有钱了。\n");
                return 1;
        }

        if (money_ob->query("base_weight") * count +
            me->query_encumbrance() > me->query_max_encumbrance())
        {
                tell_object(me, "你现在接不下这么多" + money_ob->name() + "。\n");
                tell_object(ob, "人家现在接不下你这么多" + money_ob->name() + "。\n");
                return 1;
        }

        tell_object(me, "你同意了" + ob->name(1) + "的要求。\n");
        tell_object(ob, me->name(1) + "同意了你的要求。\n");
        message_vision("$N接过了$n的" + money_ob->name() + "，把" +
                       item_ob->name() + "递给了$n。\n", me, ob);

        // 对方支付钱
        if (count == money_ob->query_amount())
                money_ob->move(me, 1);
        else
        {
                temp_ob = new(base_name(money_ob));
                temp_ob->set_amount(count);
                money_ob->add_amount(-count);
                temp_ob->move(me, 1);
        }

        // 本方提供物品
        if (combined)
        {
                if (amount == item_ob->query_amount())
                        item_ob->move(ob, 1);
                else
                {
                        temp_ob = new(base_name(item_ob));
                        temp_ob->set_amount(amount);
                        item_ob->add_amount(-amount);
                        temp_ob->move(ob, 1);
                }
        } else
        {
                while (amount--)
                        total_obs[amount]->move(ob, 1);
        }

        return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : purchase [数量] <名字> [from <玩家> with <数量> <货币>]
           purchase cancel

在你执行计划的过程中，你可以通过这条指令来购买你需要的各种武
器道具，来满足你计划的需要。

另外，你也可以使用这个命令，使用货币求购另外一个玩家身上的物
品。这个物品必须是对方亮出来的，即拿(hand)在手里的。如果你输
入的名字是 ？ 则表示购买对方手里的东西，为了保险起见，输入英
文代号更好一些。如果你提出要求以后后悔了，可以输入 cancel 参
数打消这个念头。

see also : scheme

HELP );
        return 1;
}

