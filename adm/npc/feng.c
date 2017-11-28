// 本程序用于店铺拍卖，由WIZLELVEL权限以上的巫师来启动
// 在启动拍卖之前，首先请用cshshop指令初始化所有店铺状态
// 启动进程有两种方式：巫师手工操作、系统自动运行

// 如果是启动了手工操作，在主持巫师发生如下状况，自动进程将接管拍卖：
// 主持巫师离开拍卖场
// 主持巫师退线
// 主持巫师不进行任何拍卖操作超过规定时间
// 主持巫师断线
// 主持巫师昏迷或者死亡

// 拍卖过程中本NPC物件的更新不会导致拍卖进程的中断，比如update,dest & clone

#include <ansi.h>
#include <getconfig.h>

inherit NPC;
inherit F_SAVE;

#define WIZLEVEL 3 //  能够启动和执行拍卖的巫师等级
#define DISTANCE 8 //  拍卖中间隔的时间（秒）
#define DELAY 30   //  拍卖中主持巫师没有进行任何动作的等待时间（秒）
                   //  超过这个时间，自动进程接管拍卖

string query_save_file();
int do_start(string arg);		// 启动拍卖，不使用arg参数表示启动手工进程
int do_auction(string arg);		// 指定拍卖的当前店铺
int begin_auction();			// 等待玩家竞投的守护程序
int stop_auction();			// 结束当前店铺的拍卖
int do_jupai(string arg);		// 玩家竞投中断
int go_jupai();				// 玩家竞投的守护程序
int do_qiao();				// 巫师宣价以及落棰
int do_auctionlist();			// 查询拍卖店铺列表
int do_ban(string arg);		        // 取消|恢复 玩家拍卖资格
int finish_auction(string arg);		// 结束拍卖
void heart_beat();			// 心跳线，手工拍卖守护进程
object check_operator();		// 检查主持巫师状态函数
int do_autoauction();			// 将手工进程转为自动进程
int last_time = 0;	                // 最后一次手工操作的时间
object operator;		        // 本变量记录拍卖主持者

void create()
{
        seteuid(getuid());
        restore();

        set_name("凤天南", ({ "feng tiannan", "feng", "tiannan" }));
        set("long", @LONG
他就是佛山五虎门掌门人凤天南，当年凭一套
五虎棍法名震江湖。虽然为武林人士，但却是
富甲一方。全天下各处都有他的产业。
LONG);
        set("title", "佛山五虎门掌门人");
        set("nickname", HIY "南霸天" NOR);
        set("channel_id","凤天南");
        set("gender", "男性");
        set("age", 45);
        set("combat_exp", 800000);
        set("shen", -1);
        set("attitude", "friendly");

        set("max_qi", 3000);
        set("max_jing", 2500);
        set("neili", 3500);
        set("max_neili", 3500);
        
        set_skill("force", 300);
        set_skill("unarmed", 300);
        set_skill("sword", 300);
        set_skill("parry", 300);
        set_skill("dodge", 300);

        set("apply/attack", 100);
        set("apply/defense", 100);

        setup();

        if (! clonep(this_object()))
        {
                move("/d/foshan/pmc");
                message_vision(CYN "\n$N" CYN "走了过来，看了看周"
                               "围，阴笑两声。\n" NOR, this_object());
                set("startroom", "/d/foshan/pmc");
        }

        carry_object("/d/city/npc/cloth/fu-cloth")->wear();
        set_heart_beat(1);
}


void init()
{
        ::init();
        if (wiz_level(this_player()) >= WIZLEVEL)
        {
                add_action("do_auction", ({ "auction", "paimai" }));
                add_action("do_start","start");
                add_action("do_qiao", "qiao");
                add_action("do_ban", "ban");
                add_action("finish_auction", "finish");
                add_action("do_autoauction", ({ "auto", "autopaimai"}));
        }

        add_action("do_auctionlist", ({ "list", "paimailist" }));
        add_action("do_jupai", "jupai");
}

//  存盘文档
string query_save_file()
{
        return "/data/npc/feng";
}

int do_start(string arg)
{
        object ob,me;
        int i;
        string *shop_list,msg;
        mapping *all_shop;
        mapping begin_shop;
        mapping end_shop;

        me = this_player();
        ob = this_object();

        if (ob->query("auction_start") && ! ob->query("auction_end"))
                return notify_fail("现在正在拍卖中，无法重新开始。\n");

        if (! SHOP_D->is_inited())
        {
                msg = "店铺尚未全部初始化，请在进行拍卖之前将所有"
                      "店铺初始化。\n";
                write(msg);
                return 1;
        } else
        {
                shop_list = ({});
                begin_shop = ([]);
                end_shop = ([]);
                
                remove_call_out("do_auction");
                remove_call_out("begin_auction");
                remove_call_out("stop_auction");
                remove_call_out("go_jupai");
                remove_call_out("finish_auction");
                
                all_shop = SHOP_D->query_shop();
                msg = HIC "成功初始化拍卖程序，待拍卖店铺列表： \n" NOR;
                msg += HIC "--------------------------------------\n" NOR;
                for (i = 0;i < sizeof(all_shop);i++)
                {
                        shop_list += ({ all_shop[i]["id"] });
                        begin_shop[all_shop[i]["id"]] = all_shop[i]["price"];
                        msg += sprintf(HIY "%-20s" HIW "\t%d两黄金\n" NOR,all_shop[i]["id"],all_shop[i]["price"]);
                }
                msg += HIC "--------------------------------------\n" NOR;
                msg += WHT "总共有" + chinese_number(sizeof(all_shop)) + "家店铺。\n" NOR;

                ob->delete("owner");
                ob->delete("shop_list");
                ob->delete("begin_shop");
                ob->delete("end_shop");
                ob->delete("auction_end");
                ob->delete("now_auction");
                ob->delete("temp_owner");
                ob->delete("wait_jupai");
                ob->delete("on_jupai");
                ob->delete("can_finish");

                ob->set("auction_start", 1);
                ob->set("shop_list", shop_list);
                ob->set("begin_shop", begin_shop);
                ob->set("end_shop", end_shop);

                if (arg)
                {
                        CHANNEL_D->do_channel(ob, "sys", "店铺拍卖系统由" + me->name(1) +
                                                  "成功启动。运行模式：自动。");

                        // 拍卖设置为自动运行
                        ob->set("operator", "feng tiannan");

                        msg += HIR "您选择了通过" HIW "自动运行" HIR "的方式来启"
                               "动拍卖进程。\n\n" NOR;
                        write(msg);

                        message_vision(CYN "$N" CYN "哈哈大笑道：既然各位都准备好"
                                       "了，那么咱们就开始拍卖吧。\n" NOR, ob);
                        operator = ob;
                        ob->save();
                        call_out("do_auction", 0, "automatic");
                } else
                {
                        CHANNEL_D->do_channel(ob, "sys", "店铺拍卖系统由" + me->name(1) +
                                                  "成功启动，运行模式：人工。");

		        // 拍卖设置为手工运行
                        ob->set("operator", me->query("id"));

                        msg += HIR "您选择了通过" HIW "人工操作" HIR "的方式来启"
                               "动拍卖进程。\n\n" NOR;
                        msg += WHT "拍卖的指令为(" HIY "auction <店铺ID>" NOR +
                               WHT ")。\n" NOR;
                        msg += WHT "您可以用(" HIY "auto" NOR + WHT ")指令"
                               "来将拍卖进程转成自动运行。\n" NOR;
                        write(msg);

                        message_vision(CYN "$N" CYN "擦了擦汗，赔笑道：这次的拍卖"
                                       "由$n" CYN "亲自主持。\n" NOR, ob, me);
                        message_vision(HIC "$N" HIC "干笑两声，将手中的锤子郑重交"
                                       "给$n" HIC "。\n" NOR, ob, me);
                        operator = me;

                        // 记录该次操作时间
                        last_time = time();

                        // 启动手工拍卖守护进程
                        set_heart_beat(1);
                        ob->save();
                }
        }
        return 1;
}

int do_auction(string arg)
{
        object ob;
        string *shop_list, now_shop, msg, *shop_key;
        mapping begin_shop;
        int i, now_price;

        if (! query("auction_start") || query("auction_end"))
                return notify_fail("现在并没有在进行拍卖。\n");

        if (! arg)
                return notify_fail("指令格式：auction <店铺ID>\n");

        if (query("now_shop"))
                return notify_fail("现在正在进行" + query("now_shop") +
                                   "店铺的拍卖，您别着急。\n");

        ob = this_object();

        if (ob != operator && this_player() != operator)
                return notify_fail("现在的拍卖正在由" + operator->name(1) +
                                   "主持进行中。\n");

        remove_call_out("do_auction");
        remove_call_out("finish_auction");
        remove_call_out("begin_auction");

        shop_list = query("shop_list");
        begin_shop = query("begin_shop");

	//  非自动的
        if (ob != operator)
        {
		// 已经全部拍卖完毕了
                if (sizeof(shop_list) < 1)
                {
                        set("can_finish", 1);
                        save();
                        return notify_fail(WHT "所有店铺都已经拍卖结束了，您现"
                                           "在可以结束(" HIY "finish" NOR + WHT
                                           ")拍卖了。\n" NOR);
                }

		//  提交的参数错误，重新显示所有待拍卖店铺列表
                if (! begin_shop[arg])
                {
                        msg = HIR "对不起，您所提交的店铺并不存在。\n\n" NOR;
                        msg += WHT "等待拍卖的店铺列表： \n" NOR;
                        msg += HIC "--------------------------------------\n" NOR;
                        shop_key = keys(begin_shop);

                        for (i = 0; i < sizeof(shop_key); i++)
                                msg += sprintf(HIW "%-20s" HIY "\t%d两黄金\n" NOR,
                                               shop_key[i],
                                               begin_shop[shop_key[i]]);

                        msg += HIC "--------------------------------------\n" NOR;
                        msg += WHT "总共有" + chinese_number(sizeof(shop_key)) +
                               "家店铺可以拍卖。\n\n";
                        write(msg);
                        return 1;
                }
		// 当前拍卖店铺
                now_shop = arg;
        } else	// 自动拍卖
        {
                // 全部店铺都已经拍卖完毕
                if (sizeof(shop_list) < 1)
                {
                        ob->set("can_finish", 1);
                        ob->save();
                        // 调用结束拍卖程序
                        call_out("finish_auction", 0, "automatic");
                        return 1;
                }
		// 当前拍卖店铺
                now_shop = shop_list[random(sizeof(shop_list))];
        }

	// 从待拍店铺中删除当前拍卖店铺
        shop_list -= ({ now_shop });
        now_price = query("begin_shop/" + now_shop);
        ob->set("wait_jupai", 1);
        ob->set("shop_list", shop_list);
        ob->delete("begin_shop/" + now_shop);
        ob->set("now_shop", now_shop);
        ob->set("now_price", now_price);
        ob->save();

        CHANNEL_D->do_channel(ob, "sys", "现在开始拍卖" + now_shop + "店铺。");

        message_vision(HIW "\n$N" HIW "大声道：现在开始拍卖『" HIC +
                       now_shop + HIC "店铺" HIW "』底价为" +
                       chinese_number(now_price) + "两黄金，有意者请"
                       "举牌。\n" NOR, operator);

        // 自动拍卖
        if (ob == operator)
                call_out("begin_auction", DISTANCE);
        else
                // 记录该次操作的时间
                last_time = time();

        return 1;
}

int begin_auction()
{
        string now_shop;
        int now_price,m;
        object ob;

        ob = this_object();

        m = ob->query("wait_jupai");

	// 已经有人开始举牌
        if (! m)
                return 1;

        remove_call_out("begin_auction");
        remove_call_out("stop_auction");

        now_shop = query("now_shop");
        now_price = query("now_price");

        m += 1;
        ob->set("wait_jupai",m);
        ob->save();

        switch (random(3))
        {
        case 0:

                message_vision(CYN "\n$N" CYN "接着道：正在开始拍卖" HIC +
                               now_shop + NOR + CYN "店铺。报价为" YEL +
                               chinese_number(now_price) + "两黄金"
                               CYN "第" + chinese_number(m) + "次。\n" NOR,
                               operator);
                break;

        case 1:
                message_vision(CYN "\n$N" CYN "看了看周围大声道：现在"
                               YEL + chinese_number(now_price) + "两黄金"
                               CYN "第" + chinese_number(m) + "次，"
                               YEL + chinese_number(now_price) + "两黄金"
                               CYN "第" + chinese_number(m) + "次。拍卖" +
                               HIC + now_shop + NOR + CYN "店铺。\n" NOR,
                               operator);
                break;

        default:
                message_vision(CYN "\n$N" CYN "干咳两声，大声道：现在为"
                               YEL + chinese_number(now_price) + "两黄金"
                               CYN "第" + chinese_number(m) + "次，拍卖" +
                               HIC + now_shop + NOR + CYN "店铺，欲购"
                               "者从速。\n" NOR, operator);
                break;
        }

        switch (random(4))
        {
        case 0:

                message_vision(CYN "$N" CYN "环顾了一下四周，接着说道：请有"
                               "意者举牌(" HIY "jupai" NOR + CYN ")。\n" NOR,
                               operator);
                break;

        case 1:
                message_vision(CYN "$N" CYN "皱了皱眉头，说道：有人愿意购买"
                               "么？请及时举牌(" HIY "jupai" NOR + CYN ")。\n"
                               NOR, operator);
                break;

        case 2:
                message_vision(CYN "$N" CYN "微笑道：各位考虑好了么？有人愿"
                               "意举牌(" HIY "jupai" NOR + CYN ")出价么？\n"
                               NOR, operator);
                break;

        default:
                message_vision(CYN "$N" CYN "清了清嗓子，继续说道：拍卖正在"
                               "进行，请各位举牌(" HIY "jupai" NOR + CYN ")示"
                               "意。\n" NOR, operator);
                break;
        }

	// 自动拍卖
        if (operator == ob)
        {
                if (! (m >= 3))
                        call_out("begin_auction",DISTANCE);
                else
                        call_out("stop_auction",DISTANCE);
	// 手工拍卖 
        } else
                // 记录最后一次操作的时间
                last_time = time();
}

int stop_auction()
{
        string now_shop, temp_owner, *owner, *shop_list, msg, *shop_key;
        mapping begin_shop, end_shop, *shop_record, record;
        object ob, the_owner;
        int i, now_price;
        
        remove_call_out("stop_auction");
        remove_call_out("go_jupai");
        remove_call_out("begin_auction");
        remove_call_out("finish_auction");
        remove_call_out("do_auction");

        msg = "";
        ob = this_object();
        owner = query("owner");
        temp_owner = query("temp_owner");
        shop_list = query("shop_list");
        begin_shop = query("begin_shop");
        end_shop = query("end_shop");
        now_shop = query("now_shop");
        now_price = query("now_price");

        if (! mapp(end_shop) || sizeof(end_shop) < 1)
                end_shop = ([]);

        if (! arrayp(owner) || sizeof(end_shop) < 1)
                owner = ({});

        if (query("wait_jupai"))
        {
                message_vision(BEEP + HIY "\n$N" HIY "举起手中的小木棰用"
                               "力的一敲，只听得『当』的一声巨响。\n" NOR,
                               operator);
                message_vision(HIY "$N" HIY "大声宣布道：现在" HIC + now_shop +
                               HIY "店铺的所有权拍卖流标了。\n" NOR,
                               operator);

                end_shop[now_shop] = 0;
                ob->delete("wait_jupai");
                ob->delete("now_shop");
                ob->set("end_shop", end_shop);
                ob->save();

                // 自动拍卖
                if (operator == ob)
                {
                	// 所有店铺拍卖结束
                        if (sizeof(shop_list) < 1)
                        {
                                set("can_finish", 1);
                                save();
                                call_out("finish_auction", 0, "automatic");
                                return 1;
                        }
                        call_out("do_auction", 1, "automatic");
                } else
                {
                        // 所有店铺拍卖结束
                        if (sizeof(shop_list) < 1)
                        {
                                set("can_finish", 1);
                                save();
                                tell_object(operator, WHT "所有店铺都已经拍卖结"
                                            "束，您现在可以结束(" HIY "finish"
                                            NOR + WHT ")拍卖。\n"NOR);
                                return 1;
                        }

                        msg += HIC "等待拍卖的店铺列表： \n" NOR;
                        msg += HIC "≡" HIY "──────────────" HIC "≡\n" NOR;
                        shop_key = keys(begin_shop);

                        for (i = 0; i < sizeof(shop_key); i++)
                                msg += sprintf(CYN "%-20s" WHT "\t%d两黄金\n" NOR,
                                               shop_key[i],
                                               begin_shop[shop_key[i]]);

                        msg += HIC "≡" HIY "──────────────" HIC "≡\n" NOR;
                        msg += HIC "总共有" HIY + chinese_number(sizeof(shop_key)) + HIC 
                               "家店铺可以拍卖。\n\n";

                        tell_object(operator, msg);
                        // 记录该次操作时间
                        last_time = time();
                }
                return 1;
        } else            
        {
                //  首先检查当前竞投店铺的玩家是否在线，或者是否在投标后赶回
                //  钱庄取走了存款如果该玩家数据异常，则该店铺重新归入待拍店
                //  铺数组，并且取消该玩家的拍卖资格。

                the_owner = find_player(temp_owner);
                if (! objectp(the_owner)
                   || (int)the_owner->query("balance") < (int)(now_price * 10000))
                {
                	// 取消该玩家的拍卖资格
                        do_ban(temp_owner + " 1");
                        begin_shop[now_shop] = 2000;
                        ob->set("begin_shop", begin_shop);

                        message_vision(HIY "$N" HIY "冷笑一声道：居然敢跟我玩？" +
                                       temp_owner + HIY "数据异常，取消拍卖资格"
                                       "。\n\n" NOR, operator);

                        CHANNEL_D->do_channel(ob, "sys", "由于" + temp_owner +
                                                  "数据异常，取消该玩家的拍卖资"
                                                  "格！" + now_shop + "店铺"
                                                  "重新归入待拍卖列表！");
                } else
                {
                        // 记录店铺历史数据
                        record = ([]);
                        shop_record = query(now_shop);

                        if (! sizeof(shop_record))
                                shop_record = ({});

                        record["time"] = time();
                        record["id"] = the_owner->query("id");
                        record["name"] = the_owner->name(1);
                        record["pms"] = operator->name(1);
                        record["value"] = now_price;
                        shop_record += ({ record });
                        ob->set(now_shop, shop_record);

                        the_owner->add("balance", - now_price * 10000);
                        the_owner->save();
                        owner += ({ temp_owner });
                        ob->set("owner", owner);
                        end_shop[now_shop] = now_price;
                        ob->set("end_shop", end_shop);
                        SHOP_D->change_owner(operator, now_shop, temp_owner);

                        message_vision(BEEP + HIY "\n$N" HIY "举起手中的小木棰用"
                                       "力的一敲，只听得『当』的一声巨响。\n" NOR,
                                       operator);
                        message_vision(HIY "$N" HIY "大声宣布道：成交！恭喜" +
                                       the_owner->name() + HIY "以" NOR + YEL +
                                       chinese_number(now_price) +"两黄金" HIY
                                       "的价格获得了" HIC + now_shop + HIY
                                       "店铺的所有权。\n" NOR, operator);

                        shout(HIY "【商界传闻】" NOR + WHT + operator->name() +
                              WHT "[" + operator->query("id") + WHT "]：恭喜" +
                              the_owner->name() + NOR + WHT "获得了" + now_shop +
                              NOR + WHT "店铺的所有权。\n" NOR);

                        CHANNEL_D->do_channel(ob, "sys", temp_owner + "获得了" +
                                                  now_shop + "店铺的所有权。"
                                                  "最终出价" + chinese_number(now_price) +
                                                  "两黄金！");

                        tell_object(the_owner, HIC + BLINK "\n恭喜您以" +
                                               chinese_number(now_price) +
                                               "两黄金的价格获得店铺的所有权。\n" NOR);
                }        
                ob->delete("on_jupai");
                ob->delete("now_shop");
                ob->delete("now_price");
                ob->delete("temp_owner");
                ob->save();

		// 自动拍卖
                if (operator == ob)
                {
                        // 所有店铺拍卖结束
                        if (sizeof(shop_list) < 1)
                        {
                                set("can_finish", 1);
                                save();    
                                call_out("finish_auction", 0, "automatic");
                        } else
                                call_out("do_auction", 1, "automatic");
                } else
                {
                        // 所有店铺拍卖结束
                        if (sizeof(shop_list) < 1)
                        {
                                set("can_finish", 1);
                                save();
                                tell_object(operator, WHT "所有店铺都已经拍卖结束了，您现"
                                                      "在可以结束(" HIY "finish" NOR + WHT
                                                      ")拍卖了。\n"NOR);
                                return 1;
                        }

                        msg += WHT "等待拍卖的店铺列表： \n" NOR;
                        msg += HIC "--------------------------------------\n" NOR;
                        shop_key = keys(begin_shop);

                        for (i = 0; i < sizeof(shop_key); i++)
                                msg += sprintf(HIW "%-20s" HIY "\t%d两黄金\n" NOR,
                                               shop_key[i],
                                               begin_shop[shop_key[i]]);

                        msg += HIC "--------------------------------------\n" NOR;
                        msg += WHT "总共有" + chinese_number(sizeof(shop_key)) +
                               "家店铺可以拍卖。\n\n";

                        tell_object(operator,msg);
 
                        // 记录该次操作时间
                        last_time = time();
                }
                return 1;
        }
}

int do_jupai(string arg)
{
        object ob, buyer;
        string now_shop, temp_owner;
        int money, now_price;

        ob = this_object();
        buyer = this_player();

        if (! query("auction_start"))
                return notify_fail("现在拍卖还没有开始，不必心急。\n");

	//  手工拍卖，检查执行巫师是否还在，如果不在则进程转为自动
        if (operator != ob)
                operator = check_operator();

        if (! query("now_shop"))
               return notify_fail(operator->name(1) + "还没有宣布"
                                  "要拍卖哪家店铺，你急个啥？\n");

        if (arrayp(query("owner"))
           && member_array(buyer->query("id"), query("owner")) != -1)
                return notify_fail("你已经购买到了店铺，就别太心黑了。\n");

        if (arrayp(query("ban"))
           && member_array(buyer->query("id"), query("ban")) != -1)
                return notify_fail("你已经给取消了拍卖资格，老实点吧。\n");

        if (buyer->query("id") == query("temp_owner"))
                return notify_fail("当前的价格本来就是你所竞投的。\n");

        now_shop = query("now_shop");
        now_price = query("now_price");
        temp_owner = buyer->query("id");

        if (! arg)
                money = 30;
        else
                if (! (sscanf(arg, "%d", money) == 1)
                   || money < 30
                   || money > 1000)
                        return notify_fail("你打算加价多少两(30-1000)黄金？\n");

        if ((int)buyer->query("balance") < (money + now_price) * 10000)
                return notify_fail("你帐户里的钱并不足" +
                                   chinese_number(money+now_price) + "两黄金。\n");

        remove_call_out("begin_auction");
        remove_call_out("go_jupai");
        remove_call_out("stop_auction");

        now_price += money;
        
        ob->set("temp_owner", temp_owner);
        ob->set("on_jupai", 1);
        ob->set("now_price", now_price);
        ob->delete("wait_jupai");
        ob->save();

        tell_object(buyer, HIC "你举了举手中的牌子，示意加价" +
                           chinese_number(money) + "两黄金。\n" NOR);

        message_vision(HIW "\n$N" HIW "大笑道：好！现在" + buyer->name() +
                       HIW "出价" NOR + YEL + chinese_number(now_price) +
                       "两黄金" HIW "，各位请继续出价。\n" NOR, operator);

        switch (random(3))
        {
        case 0:

                message_vision(CYN "$N" CYN "环顾了一下四周，接着说"
                               "道：有意者可继续举牌(" HIY "jupai" NOR +
                               CYN ")认购。\n" NOR, operator);
                break;

        case 1:
                message_vision(CYN "$N" CYN "微笑道：有人愿继续拼价"
                               "么？请有意者继续举牌(" HIY "jupai" NOR +
                               CYN ")出价。\n" NOR, operator);
                break;

        default:
                message_vision(CYN "$N" CYN "清了清嗓子，接着道：拍"
                               "卖正在进行，请各位继续举牌(" HIY "jupai"
                               NOR + CYN ")示意。\n" NOR, operator);
                break;
        }

	// 自动拍卖
        if (operator == ob)
                call_out("go_jupai", DISTANCE);
        else
                // 记录当前操作时间
                last_time = time();

        return 1;
}

int go_jupai()
{
        object ob;
        int m, now_price;
        string now_shop, temp_owner;
        
        remove_call_out("go_jupai");
        remove_call_out("stop_auction");

        ob = this_object();
        m = query("on_jupai");
        now_shop = query("now_shop");
        now_price = query("now_price");
        temp_owner = query("temp_owner");

        m += 1;
        ob->set("on_jupai", m);
        ob->save();

        switch (random(3))
        {
        case 0:

                message_vision(CYN "\n$N" CYN "接着道：现在正在拍卖" HIC +
                               now_shop + NOR + CYN "店铺。报价为" + YEL +
                               chinese_number(now_price) + "两黄金" CYN "第" +
                               chinese_number(m) + "次。\n" NOR, operator);
                break;

        case 1:
                message_vision(CYN "\n$N" CYN "环顾四周大声道：现在报价为"
                               YEL + chinese_number(now_price) + "两黄金"
                               CYN "第" + chinese_number(m) + "次，拍卖" +
                               HIC + now_shop + NOR + CYN "店铺。\n" NOR,
                               operator);
                break;

        default:
                message_vision(CYN "\n$N" CYN "干咳两声，大声道：现在为"
                               YEL + chinese_number(now_price) + "两黄金"
                               CYN "第" + chinese_number(m) + "次，拍卖" +
                               HIC + now_shop + NOR + CYN "店铺，欲购"
                               "者从速。\n" NOR, operator);
                break;
        }

        switch (random(3))
        {
        case 0:

                message_vision(CYN "$N" CYN "环顾了一下四周，接着说"
                               "道：有意者可继续举牌(" HIY "jupai" NOR +
                               CYN ")认购。\n" NOR, operator);
                break;

        case 1:
                message_vision(CYN "$N" CYN "微笑道：有人愿继续拼价"
                               "么？请有意者继续举牌(" HIY "jupai" NOR +
                               CYN ")出价。\n" NOR, operator);
                break;

        default:
                message_vision(CYN "$N" CYN "清了清嗓子，接着道：拍"
                               "卖正在进行，请各位继续举牌(" HIY "jupai"
                               NOR + CYN ")示意。\n" NOR, operator);
                break;
        }

	// 自动拍卖
        if (operator == ob)
        {
                if (! (m >= 3))
                        call_out("go_jupai", DISTANCE);
                else
                        call_out("stop_auction", DISTANCE);
	// 手工拍卖 
        } else
                // 记录最后一次操作的时间
                last_time = time();

        return 1;
}

int do_qiao()
{
        object ob,me;
        int m;

        ob = this_object();
        me = this_player();

        if (! query("auction_start"))
                return notify_fail(WHT "现在拍卖进程还没有启动，您可用("
                                   HIY "start" NOR + WHT ")指令来启动拍"
                                   "卖进程。\n" NOR);

        if (operator != me)
                return notify_fail("现在拍卖进程正由" + operator->name(1) +
                                   "主持中，您就看看吧。\n");

        remove_call_out("do_auction");
        remove_call_out("begin_auction");
        remove_call_out("stop_auction");
        remove_call_out("go_jupai");

        // 已经宣布所拍店铺，等待举牌中
        if (m = query("wait_jupai"))
        {
                if (! (m >= 3))
                        call_out("begin_auction", 0);
                else
                        call_out("stop_auction", 0);
        } else
        if (m = query("on_jupai"))
        {
                if (! (m >= 3))
                        call_out("go_jupai", 0);
                else
                        call_out("stop_auction", 0);
        } else
                return notify_fail("您准备继续宣布拍卖哪个店铺？\n");

        return 1;
}

int do_auctionlist()
{
        int i,now_price;
        object me;
        string msg, now_shop, *shop_key;
        mapping begin_shop, end_shop;

        msg = "";
        me = this_player();
        now_shop = query("now_shop");
        now_price = query("now_price");
        begin_shop = query("begin_shop");
        end_shop = query("end_shop");

        if (query("auction_start"))
                msg += HIC "现在正在拍卖之中。\n" NOR;
        else
                msg += HIC "现在并没有在拍卖店铺。\n" NOR;

        msg += HIC "--------------------------------------\n" NOR;

        if (now_shop)
        {
                msg += sprintf(HIY "当前拍卖店铺：\n" HIW "%-20s"
                               HIY "\t%d两黄金\n" NOR,
                               now_shop, now_price);
                msg += HIC "--------------------------------------\n" NOR;
        }

        if (mapp(begin_shop) && sizeof(begin_shop) > 0)
        {
                msg += WHT "待拍卖店铺列表： \n" NOR;
                shop_key = keys(begin_shop);

                for (i = 0; i < sizeof(shop_key); i++)
                        msg += sprintf(HIW "%-20s" HIY "\t%d两黄金\n" NOR,
                                       shop_key[i],
                                       begin_shop[shop_key[i]]);

                msg += HIC "--------------------------------------\n" NOR;
        }

        if (mapp(end_shop) && sizeof(end_shop) > 0)
        {
                msg += HIR "已被拍卖店铺列表： \n" NOR;
                shop_key = keys(end_shop);

                for (i = 0; i < sizeof(shop_key); i++)
                        msg += sprintf(HIW "%-20s" HIY "\t%d两黄金\n" NOR,
                                       shop_key[i],
                                       end_shop[shop_key[i]]);

                msg += HIC "--------------------------------------\n" NOR;
        }

        tell_object(me,msg);
        return 1;
}

int do_ban(string arg)
{
        int i, m;
        string *ban, msg;
        ban = query("ban");

        if (! ban || sizeof(ban) < 1)
                ban = ({ });

        if (! arg)
        {
                if (sizeof(ban) < 1)
                        return notify_fail("现在没有玩家给取消拍卖资格。\n");

                msg = HIC "取消拍卖资格的玩家列表：\n" NOR;
                msg += HIC "------------------------------------\n" NOR;

                for (i = 0; i < sizeof(ban); i++)
                        msg += HIY + ban[i] + "\n" + NOR;

                msg += HIC "------------------------------------\n" NOR;
                msg += WHT "总共" + sizeof(ban) + "位玩家给取消拍卖资格。\n" NOR;

                msg += HIC "\n指令格式：ban [id] [1|0]\n"
                       "其中参数id缺省表示查询，如果参数为1或是"
                       "缺省表示添加，为0表示删除。\n" NOR;

                tell_object(this_player(), msg);
                return 1;
        }

        if (sscanf(arg, "%s %d", arg, m) != 2)
                m = 1;

        if (m)
        {
                if (member_array(arg, ban) == -1)
                {
                        ban += ({ arg });
                        set("ban", ban);
                }
        } else
        {
                if (member_array(arg, ban) != -1)
                {
                        ban -= ({ arg });
                        set("ban", ban);
                }
        }
        save();
        return 1;
}

int finish_auction(string arg)
{
        object me,ob;
        ob = this_object();

        if (!arg || arg != "automatic")
        {
                me = this_player();

                if (! query("auction_start"))
                        return notify_fail("拍卖进程并没有启动。\n");

                if (! query("can_finish"))
                        return notify_fail("现在拍卖正在进行之中，无法中止。\n");

                if (operator != me)
                        return notify_fail("现在是" + operator->name(1) + "主持"
                                           "店铺拍卖，您就别操心了。\n");
        }

        remove_call_out("finish_auction");

        ob->delete("can_finish");
        ob->delete("shop_list");
        ob->delete("begin_shop");
        ob->delete("auction_start");
        ob->set("auction_end", 1);
        ob->delete("wait_jupai");
        ob->delete("on_jupai");
        ob->delete("now_shop");
        ob->delete("now_price");
        ob->delete("temp_owner");
        ob->delete("owner");
        ob->save();

        message_vision(CYN "\n$N" CYN "满意的点了点头，道：本次店铺拍卖圆"
                       "满结束。\n" NOR, operator);

        CHANNEL_D->do_channel(ob, "sys", "店铺拍卖完毕。" + operator->name(1) +
                                  "结束了拍卖进程！");

        if (operator == ob)
        {
                SHOP_D->open_all(operator);
                message_vision(CYN "$N" CYN "笑道：现在所有拍出店铺全部"
                               "开放，大家忙去吧。\n" NOR, operator);
        } else
                tell_object(operator, WHT "您现在可以用(" HIY "shop open"
                                      NOR + WHT ")指令开放店铺。\n" NOR);

        shout(HIY "【商界传闻】" NOR + WHT + operator->name() + WHT "[" +
              operator->query("id") + WHT "]：拍卖大会到此结束，各位可用"
              "(" HIY "list | shop" NOR + WHT ")查看各家店铺详情。\n" NOR);

        return 1;
}

// 心跳线 -- 用于检查启动拍卖进程的巫师是否状态正常
// 如果状态不正常，则转为自动运行模式，并且关闭心跳线
void heart_beat()
{
        int m;
        object ob,obj;
        string the_operator;

        ob = this_object();

        if (! query("auction_start") || operator == this_object())
        {
                set_heart_beat(0);
                return;
        }

        the_operator = query("operator");

        if (! the_operator)
        {
                set_heart_beat(0);
                return;
        }

        if (! operator
           || ! (obj = find_player(the_operator))
           || ! living(obj)
           || environment(obj) != environment(ob)
           || (time() - last_time) > 30)
        {
                set_heart_beat(0);
                operator = this_object();

                command("say 这个…嗯…看来他有点别的事情要忙，接下来"
                        "就我来代替吧。");

                CHANNEL_D->do_channel(ob, "sys", "由于" + the_operator +
                                          "状态异常，现在拍卖进程转入自动模式！");
                set("operator", "feng tiannan");
                save();

                if (m = query("wait_jupai"))
                {
                        if (!(m >= 3))
                               call_out("begin_auction",DISTANCE);
                        else
                               call_out("stop_auction",DISTANCE);
                } else
                if (m = query("on_jupai"))
                {
                        if (!(m >= 3))
                                call_out("go_jupai",DISTANCE);
                        else
                                call_out("stop_auction",DISTANCE);
                } else
                        call_out("do_auction", 0, "automatic");
        }

        return;
}

object check_operator()
{
        object obj;
        string the_operator;

        the_operator = query("operator");

        if (! (obj = find_player(the_operator))
           || ! living(obj)
           || environment(obj) != environment())
        {
                set("operator", "feng tiannan");
                save();
                return this_object();
        }
        return obj;
}

int do_autoauction()
{
        object ob,me;
        int m;

        ob = this_object();
        me = this_player();

        if (! query("auction_start"))
                return notify_fail("拍卖进程并没有启动，怎么自动化？\n");

        if (operator != me)
                return notify_fail("现在拍卖并不是你在主持。\n");

        operator = this_object();
        set_heart_beat(0);

        message_vision(CYN "$N" CYN "招手将$n" CYN "叫上来，说道：我"
                       "有点其它事，这里就你来处理吧。\n" NOR, me, ob);
        message_vision(CYN "$N" CYN "连忙朝$n" CYN "赔笑道：您老人家"
                       "忙您的，这里就交给我吧。\n" NOR, ob, me);

        CHANNEL_D->do_channel(ob, "sys", me->query("id") + "将拍卖进"
                                  "程转入自动模式！");
        set("operator", "feng tiannan");
        save();

        if (m = query("wait_jupai"))
        {
                if (! (m >= 3))
                        call_out("begin_auction", DISTANCE);
                else
                        call_out("stop_auction", DISTANCE);
        } else
        if (m = query("on_jupai"))
        {
                if (! (m >= 3))
                        call_out("go_jupai", DISTANCE);
                else
                        call_out("stop_auction", DISTANCE);
        } else
                call_out("do_auction", 0, "automatic");

        return 1;
}
