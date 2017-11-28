#include <ansi.h>
inherit F_CLEAN_UP;

int player_pay(object who, object target, int amount);
void destruct_it(object ob);

int main(object me, string arg)
{
        mapping goods;
        //int amount;
        int value;
        //string ob_file;
	//object *obs;
        object ob, env, obj;
	string my_id;
	//int i;
        
        if(me->is_busy())
                return notify_fail("什么事都得等你忙完再说吧！\n");

        if (! arg)
                return notify_fail("指令格式：buy <物品> from <玩家>\n");

	if (! (sscanf(arg, "%s from %s", arg, my_id) == 2) )
                return notify_fail("指令格式：buy <物品> from <玩家>\n");

        if (sizeof(all_inventory(me)) >= MAX_ITEM_CARRIED)
        {
                write("你身上的东西太多了，先处理一下再买东西吧。\n");
                return 1;
        }

        // no present or equipped
        env = environment(me);

        if (! (obj = find_player(my_id)) || ! (present(obj->query("id"), env))) 
                return notify_fail("这里没有这个商人。\n");

        if (obj == me)
                return notify_fail("问自己买东西？吃饱了撑的？\n");

        if (! obj->query("is_vendor"))
                return notify_fail(obj->name(1) + "并不是商人。\n");

        if (! obj->query_temp("on_baitan"))
                return notify_fail(obj->name(1) + "并没有摆摊。\n");

        if (! (goods = obj->query("vendor_goods")))
                return notify_fail(obj->name(1) + "并没有兜售任何货物。\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

        ob = present(arg, obj);

	if (! ob || ! objectp(ob))
                return notify_fail(obj->name(1) + "并没有兜售这样货物。\n");

        if (! goods[base_name(ob)])
                return notify_fail(obj->name(1) + "并没有兜售这样货物。\n");

        value = goods[base_name(ob)];

        if (ob->query_amount())
        {
                object old_ob;
                ob = new(base_name(old_ob = ob));
                ob->set_temp("moved_from", old_ob);
                call_out("destruct_it", 0, ob);
        }

        switch (player_pay(me, obj, value))
        {
        case 0:
                write(CYN + obj->name(1) + CYN "冷笑一声，骂道：穷"
                      "光蛋，一边呆着去。\n" NOR);
                return 1;
        case 2:
                write(CYN + obj->name(1) + CYN "皱眉道：您还有没有"
                      "零钱啊？银票我可找不开。\n" NOR);
                return 1;
        default:
                if (ob->query_amount())
                {
                        message_vision("$N从$n那里买下了" + ob->short() + "。\n",
                                        me, obj);
                } else
                {
                        message_vision("$N从$n那里买下了一" + ob->query("unit") + 
                	               ob->query("name") + "。\n",
			               me, obj);
                }
                ob->move(me, 1);

                if (objectp(ob->query_temp("moved_from")))
                {
                        ob->query_temp("moved_from")->add_amount(-1);
                        ob->delete_temp("moved_from");
                }

        }
        me->start_busy(2);
        return 1;
}

int player_pay(object who, object target, int amount)
{
	object t_ob, g_ob, s_ob, c_ob;
	int tc, gc, sc, cc, left;
	int v;

	seteuid(getuid());

	if (amount >= 100000 && t_ob = present("cash_money", who))
		tc = t_ob->query_amount();
	else
	{
		tc = 0;
		t_ob = 0;
	}

	if (g_ob = present("gold_money", who))
		gc = g_ob->query_amount();
	else
		gc = 0;

	if (s_ob = present("silver_money", who))
		sc = s_ob->query_amount();
	else
		sc = 0;

	if (c_ob = present("coin_money", who))
		cc = c_ob->query_amount();
	else
		cc = 0;
	
	v = cc + sc * 100 + gc * 10000;

	if (amount < 100000 && v < amount)
	{
		if (present("cash_money", who))
			return 2;
		else
			return 0;
	}

	v += tc * 100000;

	if (v < amount) 
		return 0;
	else {
		left = v - amount;
		if (tc)
		{
			tc = left / 100000;
			left %= 100000;
		}

		gc = left / 10000;
		left = left % 10000;
		sc = left / 100;
		cc = left % 100;

		if (t_ob && ! g_ob && gc)
		{
			g_ob = new(GOLD_OB);
			g_ob->move(who, 1);
		}

		if (t_ob)
			t_ob->set_amount(tc);

		if (g_ob)
			g_ob->set_amount(gc);
		else
                        sc += (gc * 100);

		if (s_ob)
		 	s_ob->set_amount(sc);
		else
                if (sc)
                {
			s_ob = new(SILVER_OB);
			s_ob->set_amount(sc);
			s_ob->move(who, 1);
		}

		if (c_ob)
			c_ob->set_amount(cc);
		else
                if (cc)
                {
			c_ob = new(COIN_OB);
			c_ob->set_amount(cc);
			c_ob->move(who, 1);
		}

                target->add("balance", amount * 19 / 20);
                     if (query_ip_number(target) != query_ip_number(who))

                target->add("vendor_score", amount / 2500);
		return 1;
	}
}

void destruct_it(object ob)
{
        if (! ob || environment(ob))
                return;

        destruct(ob);
}


int help (object me)
{
        write(@HELP
指令格式: buy <物品> from <玩家>

向一个玩家商人购买商品。

相关指令：list

HELP);
	return 1;
}
