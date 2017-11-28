// inherit: producing.c

// 继承房屋必须填写的数据格式：
// product -+ mineral1 +-- name : 某产品
//          |          +-- rate : 生产率
//          |          +-- max  : 最大
//          |          +-- cost : 生产时消耗的资源种类
//          |
//          + mineral2 +-- ...
//          ..

#include <ansi.h>

inherit ROOM;

void start_heart_beat()
{
        // 每天(MUD单位)心跳一次
        set_heart_beat(120);
}

void setup()
{
        mapping product;
        string mine;
        int count;

        // 这里的房间不能战斗，而且永不停息运转
        set("no_fight", 1);
        set("no_clean_up", 1);

	::setup();

        product = query("product");
        if (! mapp(product))
                return;

        foreach (mine in keys(product))
        {
                // 设置最初的产品
                count = product[mine]["max"] / 10;
                count = count / 2 + random(count);
                set_temp("stored/" + mine, count);
        }

        start_heart_beat();
}

void init()
{
        add_action("do_info", "info");
}

int query_product_amount(string name, int amount)
{
        return query_temp("stored/" + name);
}

// 如果amount < 0则表示消耗资源
void improve_product_amount(string name, int amount)
{
        mapping m;

        if (! mapp(m = query("product/" + name)))
                // 不提供这种资源
                return;

        amount += query_temp("stored/" + name);
        if (amount >= m["max"]) amount = m["max"];
        if (amount < 0) amount = 0;
        set_temp("stored/" + name, amount);
}

void heart_beat()
{
        int count;
        mapping product;
        string mine;
        mapping m;
        int rate;
        string cost;
        int cost_total;
//      int eff;

        if (! mapp(product = query("product")))
        {
                set_heart_beat(0);
                return;
        }

        // 生产产品
        foreach (mine in keys(product))
        {
                // 每次心跳消耗一些原料，生产一些产品
                if (! mapp(m = product[mine]))
                {
                        map_delete(product, mine);
                        continue;
                }

                // 计算能够生产的数量
                if (! intp(rate = m["rate"]) || rate < 1)
                        continue;

                count = rate / 2 + random(rate / 2);
                if (arrayp(m["cost"]))
                {
                        foreach (cost in m["cost"])
                                if (count > (cost_total = query_temp("stored/" + cost)))
                                        count = cost_total;

                        if (count < 1)
                                // 原料不足，无法生产
                                continue;

                        // 消耗原料
                        foreach (cost in m["cost"])
                                add_temp("stored/" + cost, -count);
                }

                // 生产完毕
                improve_product_amount(mine, count);
        }
}

int do_info(string arg)
{
        mapping product;
        mapping stored;
        string mine;
        mapping m;
        string msg;

        if (arg && arg != "") return 0;

        msg = "当前各种资源的信息：\n";

        if (! mapp(stored = query_temp("stored")) ||
            ! mapp(product = query("product")))
        {
                write("目前没有任何库存资源。\n");
                return 1;
        }

        foreach (mine in keys(stored))
        {
                if (! mapp(m = product[mine]))
                        continue;

                msg += sprintf("%-8s  库存量：" HIY "%-6d" NOR,
                               m["name"], stored[mine]);
                if (m["rate"])
                        msg += sprintf("  生产率：" HIC "%3d" NOR,
                                       m["rate"]);
                msg += "\n";
        }

        write(msg);
        return 1;
}