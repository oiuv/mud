// trans.c
// by doing

// #pragma save_binary

#include <room.h>
#include <ansi.h>

inherit ROOM;

void init_connections();

// 交通要点，所有交通信息保存在 MAP_D 中，本地连接情况保存在
// F_DBASE 中的 trans 变量中，前为所去地点，后为价格。

// 提示给顾客的信息
string trans_prompt()
{
        string msg;
        mapping trans;
        string to;
        mixed pos;

        if (! mapp(trans = query("trans")) || sizeof(trans) < 1)
                return "本店正在维修中，暂时不提供交通服务。\n";

        msg = WHT "本店现在开通了去以下地方的通路：\n" HIY
              "────────────────────\n" NOR;
        foreach (to in keys(trans))
        {
                if (! mapp(pos = MAP_D->query_trans_info(to)))
                        continue;

                msg += sprintf(" %-17s %s\n",
                               pos["name"] + "(" + to + ")",
                               MONEY_D->price_str(trans[to]));
        }
        msg += HIY "────────────────────\n" NOR
               WHT "即来即走(" HIY "goto" NOR + WHT ")无"
               "需等待，儿童一律免费。\n" NOR;

        return msg;
}

void setup()
{
        ::setup();
        init_connections();
}

// 初始化连接
void init_connections()
{
        mapping trans;
        mixed   conn;
        mixed   item;
        mapping pos;
        string  here;

        pos = MAP_D->query_trans_info();
        foreach (item in keys(pos))
        {
                if (stringp(pos[item]["room"]) &&
                    find_object(pos[item]["room"]) == this_object())
                {
                        // 确定了自己的位置
                        here = item;
                        break;
                }
        }

        if (here && arrayp(conn = MAP_D->query_connect_info()))
        {
                trans = ([ ]);
                foreach (item in conn)
                        if (item[0] == here)
                                trans[item[1]] = item[2];
                        else
                        if (item[1] == here)
                                trans[item[0]] = item[2];
                if (sizeof(trans))
                        set("trans", trans);
        }
        set("item_desc/paizi", trans_prompt());
}

void init()
{
      add_action("do_goto", "goto");
}

int do_goto(string arg)
{
        mixed  pos;
        object me;
        object cart;
        object *obs;
        int pay;

        if (! arg)
                return notify_fail("你要去哪里？\n");

        if (undefinedp(pay = query("trans/" + arg)))
                return notify_fail("看清楚牌子(paizi)，上面哪里有这个地方？\n");

        me = this_player();

        if (me->is_busy())
                return notify_fail("什么都等你忙完了再说吧。\n");

        pos = MAP_D->query_trans_info(arg);

        if (! mapp(pos) || ! stringp(pos["name"]))
        {
                write("马夫大呼道：“BUG！BUG！”\n");
                return 1;
        }

        if (! stringp(pos["room"]))
        {
                write(CYN "马夫苦笑道：“那个地方去不了哦。”\n" NOR);
                return 1;
        }

        if (wiz_level(me) > 0)
        {
                write(CYN "马夫笑道：原来是巫师啊，你不会飞么？既然非"
                      "要走路，那就不收钱了。\n" NOR);
                pay = 0;
        } else
        if (me->query("family/family_name") == "段氏皇族")
        {
                pay = 0;
                write(CYN "马夫道：呦，是您啊，您就走吧，我怎好意思收"
                      "您的钱。\n" NOR);
        } else
        if (me->query("age") <= 14)
        {
                pay = 0;
                write(CYN "马夫讶道：小小年纪就出来了？算了，我就不收"
                      "你的钱了。\n" NOR);
        } else
        if (me->query_skill("higgling", 1) >= 30)
        {
                pay = pay * 100 / (me->query_skill("higgling", 1) + 100);
                switch (random(5))
                {
                case 0:
                        write("你道：看在我常年照顾你生意份上，还不给点折扣？\n");
                        break;

                case 1:
                        write("你道：你们老板可是我的熟人啊。\n");
                        break;

                case 2:
                        write("你道：这位兄弟好，最近生意好吧，给点折扣如何？\n");
                        break;

                case 3:
                        write("你道：太贵了，便宜点，便宜点我就走了。\n");
                        break;

                case 4:
                        write("你道：我这是急事，您就行个好，便宜点吧。\n");
                        break;
                }

                pay /= 10;
                pay *= 10;
                if (pay < 10) pay = 10; 
                write(CYN "马夫无奈道：“好吧，好吧，那就" + MONEY_D->price_str(pay) +
                      CYN "算了。”\n" NOR);
        }

        if (pay > 0)
        {
                if (MONEY_D->player_pay(me, pay) != 1)
                {
                        write(CYN "马夫皱了皱眉头，说道：小本经营，概不"
                              "赊帐，准备好零钱再来。\n" NOR);
                        return 1;
                }

                message_vision(WHT "$N" WHT "付了帐，对马夫说了两句什么。\n"
                               NOR, me);
        }

        message_vision(HIC "马夫一声招呼，开过来一辆大车，$N"
                       HIC "上了车就出发了。\n" NOR, me);
        cart = new("/clone/misc/trans_cart");
        obs = filter_array(all_inventory(),
                           (: $1 == $(me) || $1->query_leader() == $(me) &&
                                          ! playerp($1) &&
                                          ! $1->is_killing($(me)->query("id")) :));
        obs->move(cart);
        me->start_call_out((: call_other, __FILE__, "arrival", me, cart, pos :), 2);
        return 1;
}

void arrival(object me, object cart, mapping pos)
{
        object *obs;

        if (! objectp(me) || ! objectp(cart))
                return;

        if (environment(me) != cart)
                return;

        obs = filter_array(all_inventory(cart),
                           (: $1 == $(me) || $1->query_leader() == $(me) &&
                                          ! playerp($1) &&
                                          ! $1->is_killing($(me)->query("id")) :));

        tell_object(me, HIY "你到了" + pos["name"] + HIY "，下了车。\n" NOR);

        obs->move(pos["room"]);

        message("vision", "吱呀吱呀一辆大车赶了过来，随即就见" +
                          me->name() + "跳了下来。\n",
                          environment(me), me);

        if (sizeof(obs = all_inventory(cart)) > 0)
        {
                message("vision", WHT "只听稀里哗啦一阵响，从车上扔下"
                                  "一堆东西来。\n" NOR, me);
                obs->move(pos["room"]);
        }

        if (objectp(cart))
                destruct(cart);
}

void reset()
{
        ::reset();
        init_connections();
}

