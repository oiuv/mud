// dealer.c 商人
// This is a inheritable object.
// Each dealer should support buy, sell, list, value 4 commands
// Updated by Vin for heros.cn 

#include <ansi.h>
#include <dbase.h>
#include <name.h>
#include <config.h>

string is_vendor_good(string arg)
{
        mixed goods;
//      object ob;
        int i;

        goods = query("vendor_goods");
        if (mapp(goods))
                goods = keys(goods);

        if (arrayp(goods))
                for (i = 0; i < sizeof(goods); i++) 
                {
                        if (goods[i]->id(arg)) return goods[i];
                        if (filter_color(goods[i]->name(1)) == arg)
                        //if (goods[i]->name(1) == arg)
                                return goods[i];
                }
        return "";
}

int do_value(string arg)
{
        object ob;
        int value;
        mixed ns;

        if (! arg || ! (ob = present(arg, this_player())))
        {
                return notify_fail("你要估什么的价？\n");
        }
        
        if (ob->query("money_id"))
        {
                write(CYN + name() + "道：你没用过钱啊？\n" NOR);
                return 1;
        }

        if (ob->is_character())
        {
                write(CYN + name() + "道：这你也拿来估价？\n" NOR);
                return 1;
        }

        if (ob->query_amount())
                value = ob->query("base_value");
        else
                value = ob->query("value");

        if (ob->query("consistence"))
                value = value * ob->query("consistence") / 100;

        if (value < 1)
                write(CYN + name() + "道：" + ob->query("name") +
                      CYN "一文不值！\n" NOR);
        else
        if (ob->query("no_drop") || (ns = ob->query("no_sell")))
        {
                if (stringp(ns))
                {
                        write(CYN + name() + "道：" + ns + "\n" NOR);
                        return 1;
                }
                write(CYN + name() + "道：这东西有点古怪，我可不好估价。\n" NOR);
        } else
                write(CYN + name() + "道：" + ob->query("name") + NOR + CYN "值" +
                      MONEY_D->price_str(value * 3 / 10) + "。\n" NOR);
        return 1;
}

int do_sell(string arg)
{
        object me;
        object ob;
        object nob;
        string my_id;
        int amount;
        int value;
        int res;
        int max_count;
        mixed ns;

        if (! arg)
                return notify_fail("你要卖什么？\n");

        if (sscanf(arg, "%s to %s", arg, my_id) == 2 && ! id(my_id))
                return 0;

        if (sscanf(arg, "%d %s", amount, arg) != 2)
                // not indicate the amount of the goods
                amount = 1;

        me = this_player();
        if (! (ob = present(arg, me)))
        {
                write("你身上没有这种东西啊！\n");
                return 1;
        }

        if (amount < 1)
        {
                write("亏你想的出来，有这样卖东西的吗？\n");
                log_file("sell", sprintf("%s(%s) 在 %s 尝试卖物品数量为负.\n",
                        me->name(1), me->query("id"), ctime(time())));
                return 1;
        }

        max_count = ob->query_amount();
        if (! max_count)
        {
                // not combined object
                if (amount > 1)
                {
                        write(ob->name() + "这种东西不能拆开来卖。\n");
                        return 1;
                }
                max_count = 1;
        } else
        {
                // is combined object
                if (amount > max_count)
                {
                        write("你身上没有这么多" + ob->name() + "。\n");
                        return 1;
                }
        }

        if (ob->query("money_id"))
        {
                write(CYN + name() + "道：哈哈哈哈！你想卖「钱」？\n" NOR);
                return 1;
        }

        if (ob->is_character())
        {
                write(CYN + name() + "道：“哼！我这里做正经生"
                      "意，不贩卖这些！”\n" NOR);
                return 1;
        }

        if (ob->query("no_drop") ||
            (ns = ob->query("no_sell")))
        {
                if (stringp(ns))
                {
                        command("say " + ns);
                        return 1;
                }
                write(CYN + name() + "摇摇头，道：“这种东西我"
                      "不识货，不敢要。”\n" NOR);
                return 1;
        }

        if (is_vendor_good(arg) != "") 
        {
                write(CYN + name() + "笑道：“我卖给你好不好？”\n" NOR);
                return 1;
        }

        if (ob->query("food_supply"))
        {
                write(CYN + name() + "不屑道：“嘿嘿，剩菜剩饭留给"
                      "您自己用吧。”\n" NOR);
                return 1;
        }
        
        if (ob->query("shaolin"))
        {
                write(CYN + name() + "惊道：“小的胆子很小，可"
                      "不敢买少林庙产。”\n" NOR); 
                return 1;
        }

        if (ob->query("mingjiao"))
        {
                write(CYN + name() + "忙摇头道：“小的只有一个脑袋，可"
                      "不敢买魔教的东西。”\n" NOR);
                return 1;
        }

        if (max_count > 1)
                value = ob->query("base_value") * amount;
        else
                value = ob->query("value");

        if (ob->query("consistence"))
                value = value * ob->query("consistence") / 100;

        if (value < 2)
                write(CYN + name() + "随手一扔，道：" + ob->query("name") +
                      CYN "一文不值！\n" NOR);
        else
        {
                if (max_count == amount)
                        res = ob->move(this_object());
                else
                {
                        nob = new(base_name(ob));
                        nob->set_amount(amount);
                        if (res = nob->move(this_object()))
                                ob->add_amount(-amount);
                        else
                                destruct(nob);
                }

                if (res)
                {
                        message_vision("$N卖掉了一" + ob->query("unit") +
                                       ob->query("name") + "给$n。\n",
                                       this_player(), this_object());
                        MONEY_D->pay_player(this_player(), value * 3 / 10);
                        ob->sold();
                } else
                        write(CYN + name() + "摇摇头，道：“对不起，"
                              "我现在不收货了。”\n" NOR);
        }
        return 1;
}

int do_list(string arg)
{
        mixed  goods;
        string *gks;
        object *obs;
        string msg;
        int i;

        mapping count;
        mapping price;
        mapping unit;
        string  short_name;
        string  prefix;
        string  *dk;

        if (arg && ! id(arg))
                return 0; // Don't notify_fail

        count   = ([]);
        unit    = ([]);
        price   = ([]);
        if (obs = all_inventory())
                for (i = 0; i < sizeof(obs); i++)
                {
                        if (obs[i]->query("equipped") ||
                            obs[i]->query("money_id") ||
                            obs[i]->is_character())
                                continue;

                        short_name = obs[i]->name(1) + "(" +
                                     obs[i]->query("id") + ")";

                        if (obs[i]->query("base_unit"))
                                prefix = "base_";
                        else
                                prefix = "";

                        if (! undefinedp(unit[short_name]))
                        {
                                count[short_name] += (prefix == "" ? 1 : obs[i]->query_amount());
                                continue;
                        }
                        count += ([ short_name : (prefix == "" ? 1 : obs[i]->query_amount()) ]);
                        unit  += ([ short_name : obs[i]->query(prefix + "unit") ]);
                        price += ([ short_name : obs[i]->query(prefix + "value") ]);
                }
    
        goods = query("vendor_goods");
        if (arrayp(goods) || mapp(goods))
        {
                gks = mapp(goods) ? keys(goods) : goods;
                for (i = 0; i < sizeof(gks); i++)
                {
                        object gob;
                        call_other(gks[i], "???");
                        if (! objectp(find_object(gks[i])))
                        {
                                log_file("log", sprintf("No found vendor good:%s\n", gks[i]));
                                continue;
                        }
                        gob = find_object(gks[i]);
                        short_name = gob->name(1) + "(" +
                                     gob->query("id") + ")";
                        if (! undefinedp(unit[short_name]))
                        {
                                count[short_name] = -1;
                                continue;
                        }
                        if (gob->query("base_unit"))
                                prefix = "base_";
                        else
                                prefix = "";
                        count += ([ short_name : -1 ]);
                        unit  += ([ short_name : gob->query(prefix + "unit") ]);
                        price += ([ short_name : (mapp(goods) && goods[gks[i]] > 0) ? goods[gks[i]]
                                                             : gob->query(prefix + "value") ]);
                }
        }

        msg = this_object()->name() + "目前出售以下物品：\n";
        dk = sort_array(keys(unit), 1);
        for (i = 0; i < sizeof(dk); i++)
        {
                int p;
                p = price[dk[i]];
                if (count[dk[i]] > 0) p = p * 12 / 10;
                //msg += sprintf("%" + sprintf("%d", (30 + color_len(dk[i]))) +
                msg += sprintf("%" + sprintf("%d", 30) +
                               "-s：每%s%s" CYN "(现货%s)\n" NOR, dk[i], unit[dk[i]], MONEY_D->price_str(p),
                               count[dk[i]] > 0 ? chinese_number(count[dk[i]]) + unit[dk[i]]
                                                : "大量供应");
        }

        write(msg);
        return 1;
}       

int do_buy(string arg)
{
        mapping goods;
        int     amount;
        int     value, val_factor;
        string  ob_file;
        object *obs;
        object  ob;
        string  my_id;
        string  start_room;
        object  room;
        object  me;
        mapping room_obmap;
        int i;
        
        if (! arg)
                return notify_fail("你想买什么？\n");

        if (sscanf(arg, "%s from %s", arg, my_id) == 2 && ! id(my_id))
                return 0;

        me = this_player();
        if (! query("carried_goods"))
        {
                if (stringp(start_room = query("startroom")) &&
                    (room = find_object(start_room)) != environment())
                {
                        // I am not in start room.
                        message_vision(CYN "$N" CYN "说道：咦？我怎么跑到这儿"
                                       "来了？\n" NOR "$N头也不回的急急忙忙溜"
                                       "走了。\n" NOR, this_object());

                        if (! objectp(room) ||
                            ! mapp(room_obmap = room->query_temp("objects")) ||
                            member_array(this_object(), values(room_obmap)) == -1)
                        {
                                destruct(this_object());
                        } else
                                this_object()->move(room);
                        return 1;
                }
        }

        if (sizeof(filter_array(all_inventory(me),
           (: ! $1->query("equipped") :))) >= MAX_ITEM_CARRIED)
        {
                write("你身上的东西太多了，先处理一下再买东西吧。\n");
                return 1;
        }

        if (sscanf(arg, "%d %s", amount, arg) != 2)
                // not indicate the amount of the goods
                amount = 1;

        if (amount > 100)
        {
                write(CYN + name() + "忙道：慢慢来，一次最多买一百件。\n" NOR);
                return 1;
        }

        // no present or equipped
        ob = present(arg, this_object());
        if (! ob && arg[0] > 160)
        {
                for (i = 0; i < sizeof(obs = all_inventory()); i++)
                        if (filter_color(obs[i]->name(1)) == arg)
                        {
                                ob = obs[i];
                                break;
                        }
        }

        if (! ob || ob->query("equipped"))
        {
                if ((ob_file = is_vendor_good(arg)) == "")
                {
                        write(ob ? "人家正用着啊，怎么会卖给你？\n"
                                 : "你想买什么？\n");
                        return 1;
                }
                ob = new(ob_file);
                if (amount > 1) ob->set_amount(amount);
                val_factor = 10;
                call_out("destruct_it", 0, ob);
        } else
        {
                if (ob->query_amount())
                {
                        object old_ob;
                        if (amount > ob->query_amount())
                        {
                                write("人家那里可没有这么多的" +
                                      ob->name() + "！\n");
                                return 1;
                        }
                        ob = new(base_name(old_ob = ob));
                        ob->set_amount(amount);
                        ob->set_temp("moved_from", old_ob);
                        call_out("destruct_it", 0, ob);
                }
                val_factor = 12;
        }

        if (ob->query("money_id"))
        {
                write(CYN + name() + "大笑道：哈哈！你要买钱？有意思！\n" NOR);
                return 1;
        }

        if (query_temp("busy"))
        {
                if (SHOP_D->is_owner(me->query("id")))
                        write(CYN + name() + CYN "赔笑道：不好意思，慢慢"
                              "来，慢慢来。\n" NOR);
                else
                        write(CYN + name() + CYN "不耐烦道：没看见我这儿"
                              "正忙着么？\n" NOR);

                return 1;
        }

        value = ob->query("value");
        if (value > 100000000 || value * val_factor / val_factor != value)
        {
                write(CYN + name() + CYN "大惊失色道：这么大一笔生意？我"
                      "可不好做。\n" NOR);
                return 1;
        }

        value = value * val_factor / 10;

        if (mapp(goods = query("vendor_goods")) &&
            (int)goods[base_name(ob)] > 0)
        {
                value = goods[base_name(ob)];
                if (value * amount / amount != value)
                {
                        write(CYN + name() + CYN "大惊失色道：“这么大一笔"
                              "生意？我可不好做。”\n" NOR);
                        return 1;
                }
                value *= amount;
        }

        if (amount > 1 && ! ob->query_amount())
        {
                write(ob->name() + "只能一" + ob->query("unit") +
                      "一" + ob->query("unit") + "的买。\n");
                return 1;
        }

        // 开了店的玩家才采购时享受八折优惠
        if (SHOP_D->is_owner(me->query("id")))
                value = value * 4 / 5;

        switch (MONEY_D->player_pay(me, value))
        {
        case 0:
                write(CYN + name() + "冷笑道：穷光蛋，一边呆着去！\n" NOR);
                return 1;
        case 2:
                write(CYN + name() + "皱眉道：您还有没有零钱啊？银票我可"
                      "找不开。\n" NOR);
                return 1;
        default:
                set_temp("busy", 1);
                if (ob->query_amount())
                        message_vision("$N从$n那里买下了" + ob->short() + "。\n",
                                       me, this_object());
                else
                        message_vision("$N从$n那里买下了一" + ob->query("unit") + 
                                       ob->query("name") + "。\n",
                                       me, this_object());

                if (SHOP_D->is_owner(me->query("id")))
                        switch (random(3))
                        {
                        case 0:
                                command("say 既然大家都是做买卖的，就给你打八折吧。");
                                break;
                        case 1:
                                command("say 也罢，既然是大老板光顾，就便宜点卖给你吧。");
                                break;
                        default:
                                command("say 呵呵。大老板又来采购么？给你算八折吧。");
                                break;
                        }

                ob->move(me, 1);
                if (objectp(ob->query_temp("moved_from")))
                {
                        ob->query_temp("moved_from")->add_amount(-amount);
                        ob->delete_temp("moved_from");
                }
        }
        remove_call_out("enough_rest");
        //call_out("enough_rest", 1 + random(3));
        call_out("enough_rest", 1);

        return 1;
}

void destruct_it(object ob)
{
        if (! ob || environment(ob))
                return;
        destruct(ob);
}

void enough_rest()
{
        delete_temp("busy");
}

void reset()
{
        int i;
        object *obs;

        obs = all_inventory();
        for (i = 0; i < sizeof(obs); i++)
                if (i >= 100 || obs[i]->query_weight() >= 1000000)
                        destruct(obs[i]);
}