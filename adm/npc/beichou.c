#include <ansi.h>

inherit NPC;
inherit F_DEALER;
inherit F_UNIQUE;

STATIC_VAR_TAG object *receiver;

object *query_receiver() { return receiver; }

int ask_fee();
int ask_bomb();
int ask_shedu();
int ask_duwan();
int ask_list();
mixed ask_cancel();
int filter_listener(object user);

void create()
{
        set_name("北丑", ({ "bei chou", "bei", "chou", "xizi" }));
        set("long", @LONG
这是一个身着戏子打扮的瘦小老头，长得尖嘴
猴腮，天生一副奸相。谁人能知这便是当今武
林中号称「南贤北丑」戏子北丑。虽其排名在
南贤之下，但却也是南贤生平最畏惧之人。
LONG);
        set("nickname", HIW "北戏子" NOR);
        set("title", HIC "武林泰斗" NOR);
        set("gender", "男性" );
        set("age", 68);
        set("attitude", "friendly");
        set("max_jing", 50000);
        set("max_qi", 50000);
        set("max_jingli", 50000);
        set("jingli", 50000);
        set("max_neili", 50000);
        set("neili", 50000);
        set("jiali", 350);
        set("str", 50);
        set("int", 50);
        set("con", 50);
        set("dex", 50);
        set("combat_exp", 12000000);

        set("inquiry", ([
                "name" : "俺就是北丑，你要打听点什么？",
                "rumor": "哼，不是戏子我吹牛，谁的谣言我都能查出来。",
                "fee"  : (: ask_fee :),
                "收费" : (: ask_fee :),
                "bomb" : (: ask_bomb :),
                "炸弹" : (: ask_bomb :),
                //"蛇毒" : (: ask_shedu :),
                "毒药" : (: ask_duwan :),
                "核弹" : (: ask_list :),
                "打听" : "嘿嘿嘿，你想打听谁？俺的消息那个灵通……",
                "南贤" : "靠，那个老头没半点学问，你有什么事情找我好了。",
                //"核炸弹"    : (: ask_list :),
                //"核子飞弹"  : (: ask_list :),
                //"核子炸弹"  : (: ask_list :),
                //"核子导弹"  : (: ask_list :),
                "飞毛腿"    : (: ask_list :),
                //"飞毛腿导弹": (: ask_list :),
                "矿泉水"    : "被飞弹炸了？来两瓶解解渴！",
                "发呆神功"  : "想学么(idle-force)？戏子我教，不收钱的。",
                "cancel"    : (: ask_cancel :),
        ]));

        set("vendor_goods", ({
                "/clone/gift/feidan",
                "/clone/gift/feimao",
                "/clone/gift/kuangquan",
        }));

        set("chat_chance", 1);
        set("chat_msg",({
                CYN "北丑嘻嘻道：戏子我没别的本事，就会打听消息，就算是巫师造谣，俺也能知道。\n" NOR,
                CYN "北丑亮出一指道：便宜啊，几两银子就能查条谣言，这可真是跳楼价。\n" NOR,
                CYN "北丑贼眯眯的说：天算地算不如人算，可是再怎么算戏子我都知道。\n" NOR,
        }));

        set_skill("dodge", 500);
        set_skill("unarmed", 500);
        set_skill("force", 500);
        set_skill("parry", 500);
        set_skill("sword", 500);
        set_skill("poison", 500);
        set_skill("medical", 500);
        set_skill("hand", 500);
        set_skill("strike", 500);
        set_skill("staff", 500);
        set_skill("finger", 500);
        set_skill("claw", 500);
        set_skill("blade", 500);
        set_skill("pixie-jian", 500);
        set_skill("literate", 500);
        set_skill("taoism", 500);
        set_skill("buddhism", 500);
        set_skill("jiuyang-shengong", 500);
        set_skill("lingbo-weibu", 500);
        set_skill("qiankun-danuoyi", 500);
        set_skill("xuanming-zhang", 500);
        set_skill("jiuyin-baiguzhao", 500);
        set_skill("dugu-jiujian", 500);
        set_skill("qianzhu-wandushou", 500);
        set_skill("ranmu-daofa", 500);
        set_skill("dagou-bang", 500);
        set_skill("shaolin-yishu", 500);
        set_skill("wudu-qishu", 500);
        set_skill("throwing", 500);
        set_skill("mantian-xing", 500);
        set_skill("idle-force", 500);
        set_skill("sad-strike", 500);

        map_skill("unarmed", "sad-strike");
        map_skill("force", "jiuyang-shengong");
        map_skill("dodge", "lingbo-weibu");
        map_skill("parry", "qiankun-danuoyi");
        map_skill("hand", "qianzhu-wandushou");
        map_skill("strike", "xuanming-zhang");
        map_skill("claw", "jiuyin-baiguzhao");
        map_skill("sword", "dugu-jiujian");
        map_skill("blade", "ranmu-daofa");
        map_skill("staff", "dagou-bang");
        map_skill("throwing", "mantian-xing");
        map_skill("poison", "wudu-qishu");
        map_skill("medical", "shaolin-yishu");

        prepare_skill("unarmed", "sad-strike");

        set("chat_chance_combat", 200);
        set("chat_msg_combat", ({
                (: perform_action, "sword.po" :),
                (: perform_action, "blade.zhenyan" :),
                (: perform_action, "blade.huo" :),
                (: perform_action, "staff.wugou" :),
                (: perform_action, "staff.chan" :),
                (: perform_action, "staff.ban" :),
                (: perform_action, "unarmed.xiao" :),
                (: perform_action, "parry.nuoyi" :),
                (: perform_action, "dodge.lingbo" :),
                (: perform_action, "throwing.shan" :),
                (: perform_action, "hand.zhugu" :),
                (: perform_action, "strike.wuji" :),
                (: perform_action, "finger.six" :),
                (: perform_action, "finger.zhongheng" :),
                (: perform_action, "claw.zhua" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
                (: exert_function, "heal" :),
                (: exert_function, "dispel" :),
                (: exert_function, "regenerate" :),
        }));

        setup();
        carry_object("d/city/obj/cloth")->wear();

        if (! clonep(this_object()))
        {
                move("/d/city/kedian");
                message_vision(CYN "\n$N" CYN "笑嘻嘻道：来了来了，戏子我来了。\n"
                               NOR, this_object());
                set("startroom", "/d/city/kedian");
        }
        set_temp("bomb_count", 1);
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}

mixed accept_ask(object ob, string topic)
{
        object fob;

        if (topic == ob->query("id"))
        {
                command("laugh " + topic);
                return 1;
        }

        fob = find_player(topic);
        if (! fob || ! ob->visible(fob)) fob = find_living(topic);
        if (! fob || ! ob->visible(fob) || ! environment(fob))
                return;

        if (fob->query("ask_cheap") >= 1)
        {
                ob->set_temp("pending/ask_beichou", topic);
                ob->set_temp("pending/ask_value", 1000);
                message_vision(CYN "$N" CYN "皱了皱眉头，对$n" CYN "摇摇"
                               "头道：看来你这次确实是遇到了困难，收你十"
                               "两白银就是了。\n" NOR, this_object(), ob);
                return 1;
        } else
        {
                ob->set_temp("pending/ask_beichou", topic);
                ob->set_temp("pending/ask_value", 100000);
                message_vision(CYN "$N" CYN "嘿嘿奸笑两声，对$n" CYN "小"
                               "声道：没有问题，不过得要十两黄金，不二"
                               "价！\n" NOR, this_object(), ob);
                return 1;
        }
}

int recognize_apprentice(object me, string skill)
{
        if (skill != "idle-force")
        {
                if (me->add_temp("illegal_learn", 1) > 3)
                {
                        command("say 滚！你怎么比南贤那个老不死的还烦？");
                        message_vision(HIC "$n飞起就是一脚，把$N"
                                       HIC "踢出门外！\n" NOR,
                                       me, this_object());
                        me->set_temp("illegal_learn", 2);
                        me->move("/d/city/beidajie1");
                        me->unconcious();
                } else
                        command("say 俺只教发呆神功，不传其它武功！");
                return -1;
        }

        message_vision(HIC "$N" HIC "向$n" HIC "请教发呆神功的诀窍。\n" NOR,
                       me, this_object());

        if (me->query_temp("learned_idle_force"))
        {
                if (me->add_temp("too_many_xue", 1) > 3)
                {
                        command("say 他奶奶的！居然比南贤那老不死还罗嗦！");
                        message_vision(HIC "$n飞起就是一脚，把$N"
                                       HIC "踢出门外！\n" NOR,
                                       me, this_object());
                        me->set_temp("too_many_xue", 1);
                        me->move("/d/city/beidajie1");
                        me->unconcious();
                } else
                        command("say 你先把俺刚才教你的领悟好再说吧！");
                return -1;
        }

        command("say 听好了！发呆神功宗旨：@#$%^&%#$#@$%&*&+*^&……");

        if (me->query("potential") < me->query("learned_points") + 10)
        {
                write(HIY "你听得稀里糊涂，看来是潜能不够了。\n" NOR);
                return -1;
        }

        if (me->query_skill("idle-force", 1) > 500)
        {
                write(HIW "你听完了心想，这些我都懂啊，看来北丑也"
                      "就知道这么多了。\n" NOR);
                return -1;
        }

        me->set_temp("learned_idle_force", 1);
        me->add("learned_points", 10);
        write(HIW "你听了心中颇有所得，马上进行发呆练习！\n" NOR);
        return -1;
}

void append_receiver(object ob)
{
        if (! receiver)
                receiver = ({ ob });
        else
                if (member_array(ob, receiver) == -1)
                        receiver += ({ ob });
}

int accept_object(object me, object ob)
{
        string wid;

        if (clonep(this_object()))
        {
                command("hehe");
                command("say 俺是真北丑，如假包换啊！");
                return 1;
        }

        if (ob->id("visible bomb"))
        {
                command("say 不要了？那就还给俺吧。");
                return 1;
        }

        if (! stringp(ob->query("money_id")))
        {
                switch (me->query_temp("beichou_refused"))
                {
                case 0:
                        command("heihei");
                        command("say 这种破烂你留着吧。");
                        me->set_temp("beichou_refused", 1);
                        return 0;

                case 1:
                        message_vision(HIC "$N" HIC "飞起一脚，把$n"
                                       HIC "踢了出去，骂道：捣什么乱"
                                       "？\n" NOR,
                                       this_object(), me);
                        break;

                case 2:
                        message_vision(HIC "$N" HIC "飞起一脚，狠狠"
                                       "的把$n" HIC "踢了出去，骂道："
                                       "居然还敢来捣乱？\n" NOR,
                                       this_object(), me);
                        me->receive_damage("qi", 100);
                        me->receive_wound("qi", 10);
                        break;

                default:
                        message_vision(HIC "$N" HIC "大怒，一招万佛"
                                       "朝宗，就见$n" HIC "像纸片一"
                                       "样飞了出去。\n" NOR,
                                       this_object(), me);
                        command("chat* heng " + me->query("id"));
                        me->unconcious();
                        break;
                }

                me->add_temp("beichou_refused", 1);
                me->move("/d/city/beidajie1");
                message_vision(HIC "只听“啪嗒”的一声，$N" HIC
                               "狠狠的摔在了地上。\n" NOR, me);
                return -1;
        }

        me->delete_temp("beichou_refused", 1);
        if (stringp(wid = me->query_temp("pending/ask_beichou", 1)))
        {
                object fob;
                int va;

                va = me->query_temp("pending/ask_value");

                if (ob->value() < va)
                {
                        message_vision(CYN "$N" CYN "冷笑一声道：就这点钱？"
                                       "打发鲁有脚还差不多。\n" NOR,
                                       this_object());
                        return 0;
                }

                me->delete_temp("pending/ask_beichou");

                fob = find_player(wid);
                if (! fob || ! me->visible(fob)) fob = find_living(wid);
                if (! fob || ! me->visible(fob) || ! environment(fob))
                {
                        message_vision(CYN "$N" CYN "挠挠头对$n" CYN "道：怪事…刚"
                                       "才我还有他的消息呢，怎么这么一会儿。\n" NOR,
                                       this_object(), me);
                        return 0;
                }

                destruct(ob);
                command("whisper " + me->query("id") +
                        " 据可靠消息，这个人刚才在" +
                        environment(fob)->short() + "。");

                if (va <= 1000)
                        fob->add("ask_cheap", -1);

                else fob->set("ask_cheap", 3);

                return 1;
        }

        if (ob->value() < 3000)
        {
                message_vision(CYN "$N" CYN "接过$n" CYN "递过去的" + ob->name() +
                               NOR + CYN "，皱了皱眉，道：就这点钱？算了，你不要就"
                               "给我吧！\n" NOR, this_object(), me);
                destruct(ob);
                return 1;
        }

        if ((int)me->query_temp("receive_rumor_time") < time())
                me->set_temp("receive_rumor_time", time());

        me->add_temp("receive_rumor_time", ob->value() / 3000 * 60);
        message_vision(CYN "$N" CYN "乐得合不拢嘴，连忙接过" + ob->name() +
                       CYN "，点头哈腰的对$n" CYN "道：好！好！\n" NOR,
                       this_object(), me);

        command("tell " + me->query("id") +
                sprintf(" 要是 %d 分钟内有人造谣，我一定揭穿他的老底。",
                        (me->query_temp("receive_rumor_time") - time()) / 60));
        destruct(ob);
        append_receiver(me);
        return 1;
}

int ask_fee()
{
        int n;
        object me;

        me = this_player();
        if (me->query_temp("receive_rumor_time") < time())
        {
                command("say 不贵不贵，三十两银子包管一分钟。");
                return 1;
        }

        n = me->query_temp("receive_rumor_time") - time();
        n /= 60;
        if (! n)
        {
                command("tell " + me->query("id") +
                        " 马上到时间啦，再想听消息，快点拿钱来啊！");
        } else
        {
                command("tell " + me->query("id") +
                        sprintf(" 你还能听 %d 分钟的消息。", n));
        }

        message("visoin", CYN + name() + CYN "嘀嘀咕咕的对" + me->name() +
                          CYN "说了一些话。\n" NOR, environment(me), ({ me }));
        return 1;
}

int ask_bomb()
{
        object ob;
        object me;
        int n;

        me = this_player();
        n = ((int)me->query_temp("receive_rumor_time")) - time();
        if (n < 0) n = 0;        
        n /= 60;
        if (! n)
        {
                command("shake");
                command("say 你问我这个干嘛？我不认识你。");
                return 1;
        }

        if (! (ob = present("visible bomb", this_object())) &&
           query_temp("bomb_count") <= 0)
        {
                command("say 可惜，我倒是想给你，可是手头没有啦！");
                return 1;
        }

        if (! ob) catch(ob = new("/clone/gift/xianxing"));

        if (! ob)
        {
                command("say 我的炸弹受潮……给不了你了！");
                return 1;
        }

        command("heihei");
        command("say 看在你照顾我生意的面子上，我就给你一颗炸弹！");

        if (! environment(ob))
                ob->move(this_object());

        command("give bomb to " + me->query("id"));
        add_temp("bomb_count", -1);
        remove_call_out("restore_bomb");
        call_out("restore_bomb", 150);
        return 1;
}

private void restore_bomb()
{
        set_temp("bomb_count", 1);
}

void receive_report(object user, string verb)
{
        string msg;

        msg = sprintf("听说%s(%s)又要发谣言了。",
                      user->query("name"), user->query("id"));
        if (random(100) < 7)
        {
                command("heihei");
                command("say " + msg);
        }

        if (! receiver)
                return;

        receiver = filter_array(receiver, (: filter_listener :));
        if (! sizeof(receiver))
        {
                receiver = 0;
                return 0;
        }

        message("vision", HIC "北丑悄悄的告诉你：" + msg + "\n",
                receiver, user);
}

private int filter_listener(object ob)
{
        if (! objectp(ob))
                return 0;

        if (present("rumor generator", ob))
                return 1;

        if (ob->query_temp("receive_rumor_time") > time())
                return 1;

        ob->delete_temp("receive_rumor_time");
        return 0;
}

int ask_duwan()
{
        object me;
        object ob;

        me = this_player();
        if (! wizardp(me) || wiz_level(me) < 2)
        {
                command("say 你…你要毒药干什么？下毒可是犯法的！");
                return 1;
        }

        command("consider");
        command("shzi");
        catch(ob = new("/clone/misc/duwan"));
        if (! ob)
        {
                command("say 毒丸出了点问题，我暂时拿不出来了。");
                return 1;
        }
        ob->move(this_object());
        command("give " + ob->query("id") + " to " + me->query("id"));
        command("say 这可是丁老怪做的，千万别我给漏了出去！");
        return 1;
}

int ask_shedu()
{
        object me;
        object ob;

        me = this_player();
        if (! wizardp(me) || wiz_level(me) < 2)
        {
                command("say 你……你要毒药干什么？下毒可是犯法的！");
                return 1;
        }

        command("heihei");
        command("shzi");
        catch(ob = new("/clone/misc/shedu"));
        if (! ob)
        {
                command("say 蛇毒出了点问题，我暂时拿不出来。");
                return 1;
        }
        ob->move(this_object());
        command("give " + ob->query("id") + " to " + me->query("id"));
        command("say 这可是欧阳疯子弄的，可别说是我给你的啊！");
        return 1;
}

int ask_list()
{
        object me;

        me = this_player();
        if (me->query_temp("can_buy/beichou/nuclues-bomb", 1))
        {
                command("say 你咋这么罗嗦？好话不说二遍。");
                return 1;
        }
        command("shzi");
        command("whisper " + me->query("id") +
                " 我身上有不少好东西，便宜得很。核弹才五两黄金一个。");
        me->set_temp("can_buy/beichou/nuclues-bomb", 1);
        return 1;
}

int do_list(string arg)
{
        if (arg && ! id(arg))
                return notify_fail("这里没有这个人。\n");

        if (this_player()->query_temp("can_buy/beichou"))
        {
                command("shzi");
                return ::do_list();
        }

        message_vision(CYN "$N" CYN "两手忙摆，对$n" CYN 
                       "道：我只卖消息不卖货，嘿嘿。\n" NOR,
                       this_object(), this_player());
        return 1;
}

int do_buy(string arg)
{
        object me;
        string my_id;

        if (arg && sscanf(arg, "%s from %s", arg, my_id) == 2 && ! id(my_id))
                return notify_fail("这里没有这个人。\n");

        me = this_player();
        if (! me->query_temp("can_buy/beichou"))
        {
                message_vision(CYN "$N" CYN "急得双手乱摆，对$n" CYN
                               "道：我说过了不卖" CYN "东西的，我可"
                               "是老实人。\n", this_object(), this_player());
                return 1;
        }

        return ::do_buy(arg);
}

mixed ask_cancel()
{
        object me = this_player();
        int t = uptime();

        if (me->is_busy() || me->is_fighting())
                return "等你忙完了再说吧！\n";

        if (! me->query("quest"))
                return "走开，别捣乱！\n";

        if (t > 900)
                return "走开，你早干什么去了？\n";
        
        me->delete("quest");

        return "好了！\n";        
}
