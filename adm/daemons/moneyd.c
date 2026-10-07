// moneyd.c  钱的功能

// by Xiang@XKX (95/12/22)
// Update by Doing for Hell

#pragma optimize
// #pragma save_binary

string money_str(int amount) {
    // returns a chinese string of `amount` of money
    string output;

    if (amount / 10000) {
        output = chinese_number(amount / 10000) + "两黄金";
        amount %= 10000;
    } else
        output = "";
    if (amount / 100) {
        output = output + chinese_number(amount / 100) + "两白银";
        amount %= 100;
    }
    if (amount)
        return output + chinese_number(amount) + "文铜钱";
    return output;
}

string price_str(int amount) {
    // returns a chinese string of `amount` of money
    string output;

    if (amount < 1)
        amount = 1;

    if (amount / 10000) {
        output = chinese_number(amount / 10000) + "两黄金";
        amount %= 10000;
    } else
        output = "";
    if (amount / 100) {
        if (output != "")
            output += "又" + chinese_number(amount / 100) + "两白银";
        else
            output = chinese_number(amount / 100) + "两白银";
        amount %= 100;
    }
    if (amount)
        if (output != "")
            return output + "又" + chinese_number(amount) + "文铜板";
        else
            return chinese_number(amount) + "文铜板";
    return output;
}

void pay_player(object who, int amount) {
    int v;
    object ob;

    seteuid(getuid());
    if (amount < 1)
        amount = 1;
    //设定取钱小于100gold时不自动转cash，取100gold以及以上的钱时才转cash 2016-12-22
    if (v = amount / 100000 && amount >= 1000000) {
        ob = new(CASH_OB);
        ob->set_amount(amount / 100000);
        ob->move(who, 1);
        amount %= 100000;
    }

    if (amount / 10000) {
        ob = new(GOLD_OB);
        ob->set_amount(amount / 10000);
        ob->move(who, 1);
        amount %= 10000;
    }
    if (amount / 100) {
        ob = new(SILVER_OB);
        ob->set_amount(amount / 100);
        ob->move(who, 1);
        amount %= 100;
    }
    if (amount) {
        ob = new(COIN_OB);
        ob->set_amount(amount);
        ob->move(who, 1);
    }
}

// Parse a complete positive decimal before arithmetic; sscanf can overflow.
int parse_trade_amount(string text, int maximum) {
    int value, digit, i;

    if (!stringp(text) || text == "" || maximum < 1)
        return 0;
    if (text[0] == '+')
        text = text[1..];
    if (text == "")
        return 0;
    for (i = 0; i < strlen(text); i++) {
        digit = text[i] - '0';
        if (digit < 0 || digit > 9 || value > maximum / 10 ||
            (value == maximum / 10 && digit > maximum % 10))
            return 0;
        value = value * 10 + digit;
    }
    return value;
}

// 无副作用的付款预检；拍卖与实际付款共用银票、找零及溢出规则。
mapping query_payment(object who, int amount) {
    object t_ob, g_ob, s_ob, c_ob;
    int tc, gc, sc, cc, left;
    int v;

    if (!objectp(who) || amount < 1)
        return ([ "status": 0 ]);

    if ((amount >= 100000 || who->query("doing") == "scheme") &&
        objectp(t_ob = present("cash_money", who)))
        // 昂贵物品或是计划中可以使用银票
        tc = t_ob->query_amount();
    else {
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

    if (cc < 0 || sc < 0 || gc < 0 || tc < 0 || sc > (MAX_INT - cc) / 100)
        return ([ "status": 0 ]);
    v = cc + sc * 100;
    if (gc > (MAX_INT - v) / 10000)
        return ([ "status": 0 ]);
    v += gc * 10000;
    if (amount < 100000 && v < amount) {
        if (present("cash_money", who))
            return ([ "status": 2 ]);
        else
            return ([ "status": 0 ]);
    }

    if (tc > (MAX_INT - v) / 100000)
        return ([ "status": 0 ]);
    v += tc * 100000;
    if (v < amount)
        return ([ "status": 0 ]);
    else {
        left = v - amount;
        if (tc) {
            tc = left / 100000;
            left %= 100000;
        }
        gc = left / 10000;
        left = left % 10000;
        sc = left / 100;
        cc = left % 100;

        if (!g_ob && !t_ob) {
            sc += (gc * 100);
            gc = 0;
        }
        // 未参与付款的银票保持原样，但也计入负重预检。
        if (!t_ob && objectp(t_ob = present("cash_money", who))) {
            tc = t_ob->query_amount();
        }
        return ([ "status": 1, "objects": ({ t_ob, g_ob, s_ob, c_ob }),
            "amounts": ({ tc, gc, sc, cc }) ]);
    }
}

int player_pay(object who, int amount) {
    mapping plan;
    object *coins, *created;
    object coin;
    string *files;
    int *counts;
    int i;
    mixed err;

    plan = query_payment(who, amount);
    if (plan["status"] != 1) return plan["status"];
    seteuid(getuid());
    coins = plan["objects"];
    counts = plan["amounts"];
    files = ({ CASH_OB, GOLD_OB, SILVER_OB, COIN_OB });
    created = allocate(4);
    // 先准备找零；创建失败时还没有扣除原币。
    for (i = 0; i < 4; i++) {
        if (coins[i] || !counts[i]) continue;
        err = catch(created[i] = new(files[i]));
        if (!err) err = catch(created[i]->set_amount(counts[i]));
        if (err) {
            foreach (coin in created) if (objectp(coin)) destruct(coin);
            return 0;
        }
    }
    for (i = 0; i < 4; i++) {
        if (!coins[i]) continue;
        // 不让已用尽的零数量钱币在本次同步结算中继续占用负重。
        if (!counts[i]) destruct(coins[i]);
        else coins[i]->set_amount(counts[i]);
    }
    for (i = 0; i < 4; i++)
        if (created[i]) created[i]->move(who, 1);
    return 1;
}

int player_carry(object ob) {
    object cash_ob;
    object gold_ob;
    object silver_ob;
    object coin_ob;
    int gold;

    gold = ob->query("balance") / 10000;

    cash_ob = present("cash_money", ob);
    gold_ob = present("gold_money", ob);
    silver_ob = present("silver_money", ob);
    coin_ob = present("coin_money", ob);
    if (cash_ob)
        gold += cash_ob->query_amount() * 10;
    if (gold_ob)
        gold += gold_ob->query_amount();
    if (silver_ob)
        gold += silver_ob->query_amount() / 100;
    if (coin_ob)
        gold += coin_ob->query_amount() / 10000;
    return gold;
}
