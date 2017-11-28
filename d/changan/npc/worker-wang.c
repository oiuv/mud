// worker-liu.c

inherit NPC;

#include <ansi.h>

// 接收的货物
#define CHECK_GOODS     "stone"

void create()
{
	set_name("王石匠", ({ "wang shijiang", "wang" }) );
	set("title", HIY "天国大匠" NOR);
	set("gender", "男性" );
	set("age", 48);
	set("str", 35);
	set("long", @LONG
一个满脸沧桑的老匠人，看上去依然强壮有力。眼神中透露出自信
与威严。
LONG);
	set("attitude", "friendly");

	setup();

	carry_object("/clone/cloth/cloth")->wear();
}

void init()
{
        set_heart_beat(1);
}

int filter_ob(object ob)
{
        object owner;

        if (! ob->is_transport())
                return 0;

        owner = ob->query_owner();
        if (! objectp(owner))
                // 该车无主
                return 0;

        if (environment(owner) != environment())
                // 主人不在
                return 0;

        if (ob->query_temp("goods/id") != CHECK_GOODS)
                // 没有装载石料
                return 0;

        if (ob->query_temp("goods/amount") < 1)
                // 没有货
                return 0;

        return 1;
}

void heart_beat()
{
        object *obs;
        object ob;
        object owner;
        string startroom;
        int amount;
//      mapping job;
        mapping goods;
//      object bonus;

        ::heart_beat();
        if (! environment())
                return;

        if (! stringp(startroom = query("startroom")) ||
            find_object(startroom) != environment())
                // 不在出生地点
                return;

        obs = all_inventory(environment());
        obs = filter_array(obs, (: filter_ob :));
        if (sizeof(obs) < 1)
        {
                // 没有到达合适的车辆，停止心跳
                set_heart_beat(0);
                return;
        }

        // 到达了合适的车辆
        ob = obs[0];
        owner = ob->query_owner();
        message_vision("$N看到$n押货而来，连连点头道：“很"
                       "好！很好！就卸到这里吧！”\n",
                       this_object(), owner);
        tell_object(owner, "你卸下" + ob->query_temp("goods/name") +
                    "，将" + ob->name() + "交给学徒拉走。\n");

        // 卸下石料
        goods = ob->query_temp("goods");
        amount = goods["amount"];
        environment()->improve_product_amount(goods["id"], amount);

        // 给与奖励
        MONEY_D->pay_player(owner, amount / 100 * 300);
        tell_object(owner, "你领到了一些工钱。\n");
        if (ob->query_temp("job/owner") == owner)
        {
                // 这个是本人领的工作，获得奖励
				//基础奖励增加10倍（2015年4月25日）
                GIFT_D->bonus(owner, ([ "exp" : 150 + random(50),
                                        "pot" : 150 + random(50),
                                        "score" : 30 + random(10),
                                        "prompt" : "通过这次押送" + goods["name"] + HIG ]));

                // 去掉我做这个工作的信息
                owner->delete("job/" + ob->query_temp("job/info"));
        }
        destruct(ob);

        if (sizeof(obs) < 2)
        {
                // 已经处理完毕，没有新的车辆到达，停止心跳
                set_heart_beat(0);
        }
}