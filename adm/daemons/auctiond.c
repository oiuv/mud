// auctiond.c
// 拍卖系统
// Written by jjgod for hell. 01/10/01.

#pragma optimize
// #pragma save_binary

#include <ansi.h>

inherit F_DBASE;

int clean_up() { return 1; }

#define auction_info    my["auction_info"]

public void add_auction(object me, object ob, int money);
public void cancel_auction(object me);
public string check_auction_info();
private void message_auction(string msg);
private string check_auction(object ob);
private int valid_lot(object seller, object goods);
private int settle(object seller, object buyer, object goods, int price);

void create() {
    mapping my;

    seteuid(getuid());

    set("channel_id", "拍卖师[Auctioneer]");
    CHANNEL_D->do_channel(this_object(), "sys", "拍卖精灵已经启动。");

    my = query_entire_dbase();
    auction_info = ([]);
    set_heart_beat(1);
}

void heart_beat() {
    mapping my;
    string *id;
    int i, money;
    object me;
    object ob;
    object obj;

    my = query_entire_dbase();

    if (!mapp(auction_info) || !sizeof(auction_info))
        return;

    id = keys(auction_info);

    for (i = 0; i < sizeof(id); i++) {
        if (!objectp(me = find_player(id[i]))) {
            map_delete(auction_info, id[i]);
            continue;
        }
        if (!valid_lot(me, obj = auction_info[id[i]]["goods"])) {
            map_delete(auction_info, id[i]);
            continue;
        }
        ob = 0;
        if (stringp(auction_info[id[i]]["now"]) &&
            !objectp(ob = find_player(auction_info[id[i]]["now"]))) {
            map_delete(auction_info[id[i]], "now");
        }

        if (time() - auction_info[id[i]]["time"] >= 10) {
            if (auction_info[id[i]]["state"] >= 3) {
                if (!objectp(ob)) {
                    message_auction(sprintf("%s(%s)的%s无人竞价，取消拍卖。",
                        me->name(), id[i],
                        filter_color(obj->short())));
                    map_delete(auction_info, id[i]);
                    continue;
                } else {
                    // 每笔只结算一次；失败也撤单，不在后续心跳重扣。
                    money = auction_info[id[i]]["value"];
                    map_delete(auction_info, id[i]);
                    settle(me, ob, obj, money);
                    continue;
                }
            }
            auction_info[id[i]]["state"] += 1;
            auction_info[id[i]]["time"] = time();
            message_auction(sprintf("%s(%s)的%s，%s第%s次。",
                me->name(), id[i],
                filter_color(obj->short()),
                MONEY_D->money_str(auction_info[id[i]]["value"]),
                chinese_number(auction_info[id[i]]["state"])));
        }
    }
}

// 添加一个拍卖品
public void add_auction(object me, object ob, int money) {
    mapping my;
    string id;
    string msg;

    my = query_entire_dbase();
    id = me->query("id");

    if (mapp(auction_info[id])) {
        tell_object(me, "你正在拍卖别的东西，不能添加新的拍卖品"
            "。\n");
        return;
    }
    if (!objectp(ob) || environment(ob) != me || money < 1) {
        tell_object(me, "请用自己随身的物品，并定一个合适的底价。\n");
        return;
    }
    if (stringp(msg = check_auction(ob))) {
        tell_object(me, msg);
        return;
    }
    if (money / 25 && MONEY_D->query_payment(me, money / 25)["status"] != 1) {
        tell_object(me, "你付不起佣金呀。\n");
        return;
    }

    auction_info[id] = ([ "goods": ob,
        "time": time(),
        "value": money,
        "lot": money / 25,
        "state": 1, ]);
    tell_object(me, "你开始拍卖" + ob->short() + NOR "，目前" +
        (strlen(msg = MONEY_D->money_str(money / 25)) ?
            "你需要付出" + msg : "不需要付出") + "佣金。\n");
    message_auction(sprintf("%s(%s)拍卖%s，%s第一次。", me->name(),
        id, filter_color(ob->short()),
        MONEY_D->money_str(money),));
    return;
}

// 检测拍卖物品
private string check_auction(object ob) {
    string msg;

    if (!ob->query("value") && !ob->query("base_value"))
        return "这玩意儿可不值钱哪。\n";

    if (ob->query("no_sell") || ob->query("no_drop")) {
        if (stringp(msg = ob->query("no_sell")))
            return msg;
        return "这个东西可不能卖了。\n";
    }

    if (ob->is_character())
        return "这你也拿来拍卖？\n";

    if (ob->query("money_id"))
        return "你没用过钱啊？\n";

    if (ob->query("food_supply"))
        return "吃的喝的等卖出去都馊了。\n";
}

// 取消拍卖物品
public void cancel_auction(object me) {
    mapping my;
    string id;
    string name;
    object ob;

    id = me->query("id");
    my = query_entire_dbase();

    if (!mapp(auction_info[id])) {
        tell_object(me, "你没有在拍卖任何东西。\n");
        return;
    }

    if (objectp(ob = auction_info[id]["goods"]))
        name = filter_color(ob->short());
    else name = "拍卖品";

    tell_object(me, "你取消了拍卖。\n");
    message_auction(sprintf("%s(%s)取消了拍卖%s的%s。", me->name(), id,
        gender_pronoun(me->query("gender")), name,));
    map_delete(auction_info, id);
    return;
}

// 查看拍卖物品
public string check_auction_info() {
    mapping my;
    string msg, name;
    string *id;
    object ob;
    int i;

    my = query_entire_dbase();

    if (!mapp(auction_info) || !sizeof(auction_info))
        msg = "目前没有任何正在拍卖的物品。\n";

    else {
        msg = "目前正在拍卖的物品有以下这些：\n";
        msg += HIC "≡" HIY "--玩家--------------------物品------------------"
            "------竞价者--------------价格------------" HIC "≡\n" NOR;

        id = keys(auction_info);
        for (i = 0; i < sizeof(id); i++) {
            if (!find_player(id[i])) {
                map_delete(auction_info, id[i]);
                continue;
            }
            if (!valid_lot(find_player(id[i]), ob = auction_info[id[i]]["goods"])) {
                map_delete(auction_info, id[i]);
                continue;
            }

            if (!stringp(auction_info[id[i]]["now"]) ||
                !objectp(find_player(auction_info[id[i]]["now"])))
                name = "无";
            else name = find_player(auction_info[id[i]]["now"])->name() + "(" + find_player(auction_info[id[i]]["now"])->query("id") + ")";

            msg += sprintf(HIC "  %-20s %-30s %-20s %-20s\n" NOR,
                find_player(id[i])->name() + "(" +
                find_player(id[i])->query("id") + ")",
                filter_color(ob->short()),
                name,
                MONEY_D->money_str(auction_info[id[i]]["value"]));
        }
        msg += HIC "≡" HIY "----------------------------------------------------"
            "--------------------------------------" HIC "≡\n" NOR;
        msg += sprintf("目前共有%s件拍卖品。\n", chinese_number(sizeof(auction_info)));
        if (!sizeof(auction_info)) msg = "目前没有任何正在拍卖的物品。\n";
    }
    return msg;
}

// 参与竞价
public void join_auction(object me, string name, int money) {
    mapping my;
    object ob;
    object obj;

    my = query_entire_dbase();

    if (!mapp(auction_info[name])) {
        tell_object(me, "这个人没有在拍卖什么东西。\n");
        return;
    }
    if (!objectp(ob = find_player(name))) {
        tell_object(me, "这个人已经不在线了耶。\n");
        map_delete(auction_info, name);
        return;
    }
    if (!valid_lot(ob, obj = auction_info[name]["goods"])) {
        tell_object(me, "这个人现在已经没有这个东西了耶。\n");
        map_delete(auction_info, name);
        return;
    }
    if (money <= auction_info[name]["value"]) {
        tell_object(me, "这个价人家恐怕不会要。\n");
        return;
    }
    if (stringp(auction_info[name]["now"]) &&
        auction_info[name]["now"] == me->query("id")) {
        tell_object(me, "好像上次出价的就是你吧。\n");
        return;
    }

    message_auction(sprintf("%s(%s)购买%s(%s)的%s，%s第一次。",
        me->name(), me->query("id"), ob->name(),
        name, filter_color(obj->short()),
        MONEY_D->money_str(money)));
    auction_info[name]["now"] = me->query("id");
    auction_info[name]["value"] = money;
    auction_info[name]["time"] = time();
    auction_info[name]["lot"] = money / 25;
    auction_info[name]["state"] = 1;

    return;
}

private int valid_lot(object seller, object goods) {
    return objectp(seller) && objectp(goods) && environment(goods) == seller && !check_auction(goods);
}

private int *wallet(object who) {
    object coin;
    string *files;
    int *counts;
    int i;

    counts = allocate(4);
    files = ({ CASH_OB, GOLD_OB, SILVER_OB, COIN_OB });
    foreach (coin in all_inventory(who))
        if ((i = member_array(base_name(coin), files)) != -1)
            counts[i] += coin->query_amount();
    return counts;
}

private int wallet_weight(int *counts) {
    string *files;
    int i, total, weight;

    files = ({ CASH_OB, GOLD_OB, SILVER_OB, COIN_OB });
    for (i = 0; i < 4; i++) {
        weight = files[i]->query("base_weight");
        if (counts[i] < 0 || counts[i] > (MAX_INT - total) / weight) return -1;
        total += counts[i] * weight;
    }
    return total;
}

// 准备确定的钱币对象，避免交付拍品后才发现无法创建货款。
private object *prepare_wallet(int *counts) {
    object *coins;
    object coin;
    string *files;
    int i;
    mixed err;

    coins = allocate(4);
    files = ({ CASH_OB, GOLD_OB, SILVER_OB, COIN_OB });
    for (i = 0; i < 4; i++) {
        if (!counts[i]) continue;
        err = catch(coins[i] = new(files[i]));
        if (!err) err = catch(coins[i]->set_amount(counts[i]));
        if (err) {
            foreach (coin in coins) if (objectp(coin)) destruct(coin);
            error("Unable to prepare auction money.\n");
        }
    }
    return coins;
}

private void replace_wallet(object who, object *coins) {
    object coin;

    // 只处理四种标准货币；取消旧的零数量对象也避免延迟销毁误伤退款。
    foreach (coin in all_inventory(who))
        if (member_array(base_name(coin), ({ CASH_OB, GOLD_OB, SILVER_OB, COIN_OB })) != -1)
            destruct(coin);
    foreach (coin in coins)
        if (objectp(coin) && (coin->move(who) != 1 || environment(coin) != who))
            error("Auction money delivery failed.\n");
}

private int fits(object who, int before, int after, int extra) {
    int other;

    if (before < 0 || after < 0) return 0;
    other = who->query_encumbrance() - before;
    return after <= who->query_max_encumbrance() - other - extra;
}

private int settle(object seller, object buyer, object goods, int price) {
    mapping payment, commission;
    int *buyer_before, *seller_before, *seller_after;
    object *proceeds, *buyer_refund, *seller_refund;
    object coin;
    int fee, left, paid, charged, moved, buyer_weight, seller_weight;
    int attempted_buyer, attempted_seller;
    string name;
    mixed err;

    if (!valid_lot(seller, goods) || !objectp(buyer) || price < 1) return 0;
    // 自己竞买没有交付对象，也不应先后覆盖同一个钱袋。
    if (buyer == seller) return 0;
    fee = price / 25;
    payment = MONEY_D->query_payment(buyer, price);
    buyer_before = wallet(buyer);
    seller_before = wallet(seller);
    commission = fee ? MONEY_D->query_payment(
        seller,
        fee
    ) : ([ "status": 1, "amounts": seller_before + ({}) ]);
    if (payment["status"] != 1 || commission["status"] != 1) {
        tell_object(buyer, "货款或佣金不足，这笔拍卖只好作罢。\n");
        tell_object(seller, "货款或佣金不足，这笔拍卖只好作罢。\n");
        return 0;
    }
    seller_after = commission["amounts"] + ({});
    // 与 pay_player 相同：不足一百万文的货款不换银票。
    left = price;
    if (left >= 1000000) {
        seller_after[0] += left / 100000;
        left %= 100000;
    }
    seller_after[1] += left / 10000;
    seller_after[2] += (left % 10000) / 100;
    seller_after[3] += left % 100;
    buyer_weight = wallet_weight(buyer_before);
    seller_weight = wallet_weight(seller_before);
    if (!fits(buyer, buyer_weight, buyer_weight, 0) ||
        !fits(seller, seller_weight, seller_weight, 0) ||
        !fits(buyer, buyer_weight, wallet_weight(payment["amounts"]), goods->weight()) ||
        !fits(seller, seller_weight, wallet_weight(commission["amounts"]), 0) ||
        !fits(seller, seller_weight, wallet_weight(seller_after), -goods->weight())) {
        tell_object(buyer, "东西或找零太重，无法随身交清，这笔拍卖只好作罢。\n");
        tell_object(seller, "东西或货款太重，无法随身交清，这笔拍卖只好作罢。\n");
        return 0;
    }
    name = filter_color(goods->short());
    proceeds = buyer_refund = seller_refund = ({});
    err = catch {
        proceeds = prepare_wallet(seller_after);
        buyer_refund = prepare_wallet(buyer_before);
        seller_refund = prepare_wallet(seller_before);
        attempted_buyer = 1;
        paid = MONEY_D->player_pay(buyer, price) == 1;
        if (paid) {
            attempted_seller = fee > 0;
            charged = !fee || MONEY_D->player_pay(seller, fee) == 1;
        }
        if (paid && charged) moved = goods->move(buyer);
    };
    if (err || !paid || !charged || moved != 1 || !objectp(goods) || environment(goods) != buyer) {
        // 普通拒绝移动时拍品仍在卖家处；恢复原币种及数量，而非强制撒在地上。
        if (attempted_buyer) replace_wallet(buyer, buyer_refund);
        if (attempted_seller) replace_wallet(seller, seller_refund);
        foreach (coin in proceeds + buyer_refund + seller_refund)
            if (objectp(coin) && !environment(coin)) destruct(coin);
        tell_object(buyer, "这笔拍卖未能交清，已付的钱原数退回。\n");
        tell_object(seller, "这笔拍卖未能交清，已付的佣金原数退回。\n");
        return 0;
    }
    replace_wallet(seller, proceeds);
    foreach (coin in buyer_refund + seller_refund) if (objectp(coin)) destruct(coin);
    message_auction(sprintf("%s(%s)的%s与%s成交了。", seller->name(), seller->query("id"), name,
        buyer->name()));
    tell_object(buyer, "你收到了" + seller->name() + "送来的" + name + "。\n");
    tell_object(seller, "你把" + name + "交人带给了" + buyer->name() + "，货款也已收妥。\n");
    return 1;
}

// 发送拍卖信息
private void message_auction(string msg) {
    CHANNEL_D->do_channel(this_object(), "bill", msg);
}
