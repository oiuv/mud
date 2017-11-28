// moye.c  莫邪
// Written by Doing Lu  1998/11/2
// Ivy 修改增加如意乾坤袋的制作 2015/05/05

inherit NPC;
inherit F_NOCLONE;

#include <ansi.h>

int     ask_me();
int     no_money();

#define ITEM_TYPE       0
#define ITEM_STYPE      1
#define ITEM_UNIT       2
#define ITEM_WEIGHT     3
#define ITEM_POINT      4
#define ITEM_PROP       5

#define DEPOT_OB               "/clone/misc/depot_ob.c"

STATIC_VAR_TAG mapping item_type = ([
//      类型        道具类别  继承文件  单位  分量 点数 特殊变量
        "刀"   : ({ "weapon", "blade",  "把", 150, 100, 0, }),
        "剑"   : ({ "weapon", "sword",  "柄", 150, 100, 0, }),
        "棍"   : ({ "weapon", "club",   "根", 150, 100, 0, }),
        "杖"   : ({ "weapon", "staff",  "根", 150, 100, 0, }),
        "锤"   : ({ "weapon", "hammer", "把", 350, 100, 0, }),
        "斧"   : ({ "weapon", "axe",    "把", 220, 100, 0, }),
        "鞭"   : ({ "weapon", "whip",   "根", 150, 100, 0, }),
        "短兵" : ({ "weapon", "dagger", "支", 30,  100, 0, }),
        "护甲" : ({ "armor",  "armor",  "张", 150, 80,
                     ([ "armor_prop" : ([ "parry"   : "apply_armor() / 15 + 1",
                                          "armor"   : "apply_armor()",
                                       ]),
                      ]) }),
        "战衣" : ({ "armor",  "cloth",  "件", 200, 100, 0, }),
        "靴子" : ({ "armor",  "boots",  "双", 60,  40,
                     ([ "armor_prop" : ([ "dodge"   : "apply_armor() / 10 + 1",
                                          "armor"   : "apply_armor()",
                                       ]),
                      ]) }),
        "头盔" : ({ "armor",  "head",   "顶", 75,  50,  0, }),
        "腰带" : ({ "armor",  "waist",  "条", 80,  40,  0, }),
        "护腕" : ({ "armor",  "wrists", "对", 50,  25,
                     ([ "armor_prop" : ([ "sword"   : "apply_armor() / 6 + 1",
                                          "staff"   : "apply_armor() / 6 + 1",
                                          "blade"   : "apply_armor() / 6 + 1",
                                          "club"    : "apply_armor() / 6 + 1",
                                          "hammer"  : "apply_armor() / 6 + 1",
                                          "whip"    : "apply_armor() / 6 + 1",
                                          "dagger"  : "apply_armor() / 6 + 1",
                                          "stick"   : "apply_armor() / 6 + 1",
                                          "unarmed" : "apply_armor() / 6 + 1",
                                          "claw"    : "apply_armor() / 6 + 1",
                                          "cuff"    : "apply_armor() / 6 + 1",
                                          "hand"    : "apply_armor() / 6 + 1",
                                          "strike"  : "apply_armor() / 6 + 1",
                                          "finger"  : "apply_armor() / 6 + 1",
                                          "parry"   : "apply_armor() / 6 + 1",
                                          "whip"    : "apply_armor() / 6 + 1",
                                          "armor"   : "apply_armor()",
                                       ]),
                      ]) }),
        "箫"   : ({ "weapon", "xsword", "支", 30,  100, 0, }),
        "铁掌" : ({ "armor",  "hands",  "双", 45,  100,
                    ([ "armor_prop" : ([ "cuff"   : "10",
                                         "strike" : "10",
                                         "unarmed" : "10",
                                         "unarmed_damage" : "apply_damage()",
                                         "armor"  : "10",
                                       ]),
                     ]) }),
        "指套" : ({ "armor",  "hands",  "套", 35,  100,
                    ([ "armor_prop" : ([ "claw"   : "10",
                                         "finger" : "10",
                                         "hand" : "10",
                                         "unarmed_damage" : "apply_damage()",
                                         "armor"  : "10",
                                       ]),
                     ]) }),
]);

void create()
{
        set_name("莫邪", ({ "mo ye", "moye", "mo" }));
        set("long", "她长得清美秀丽，一副不食人间烟火的模样。\n"
                    "她就是铸剑大师干将的妻子。\n" );

        set("nickname", HIY "剑仙" NOR);
        set("gender", "女性");
        set("attitude", "friendly");

        set("age", 1525);
        set("shen_type", 0);
        
        set("str", 1000);                       // 保证不会因为负荷过大而接受不了东西

        set("inquiry", ([
                "炼制" : (: ask_me :),
                "铸剑" : (: ask_me :),
                "炼剑" : (: ask_me :),
                "炼刀" : (: ask_me :),
                "炼杖" : (: ask_me :),
                "炼鞭" : (: ask_me :),
                "炼锤" : (: ask_me :),
                "炼棍" : (: ask_me :),
                "炼甲" : (: ask_me :),
                "打造" : (: ask_me :),
                "铸造" : (: ask_me :),
                "制造" : (: ask_me :),
                "打制" : (: ask_me :),
                "定制" : (: ask_me :),
                "定做" : (: ask_me :),
                "定造" : (: ask_me :),
                "兵器" : (: ask_me :),
                "道具" : (: ask_me :),
                "装备" : (: ask_me :),
                "武器" : (: ask_me :),
                "刀剑" : (: ask_me :),
                "装甲" : (: ask_me :),                
                "没钱" : (: no_money :),
                "钱不够":(: no_money :),
                "等会" : (: no_money :),
                "销毁" : "那你就把东西给干将，他来做主。",
                "退货" : "那你就把东西给干将，他来做主。",
                "原料" : "炼制道具可不能没有原料啊，要想炼制好武器就得有"
                         "玄铁石一类的东西。\n          要想炼制好防具就"
                         "得有天蚕丝那些东西。这些原料很难找，可遇不可求啊！\n",
                "价格" : "你把原料给我看看(" HIY "show" NOR + CYN ")，我就能估摸出一个价钱。" NOR,
                "乾坤袋":"给我一块乾坤石，我可以帮你炼制成如意乾坤袋。",
        ]));

        setup();

        set("startroom", "/d/item/xiaowu");
        check_clone();
        if (! this_object()) return;

        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        object me;

        // 清除询问标志
        if (! objectp(me = this_player()) || ! interactive(me))
                return;

        add_action("do_show", "show");
        add_action("do_answer", "answer");
        if (me->query_temp("item/status") == "item_gived")
        {
                remove_call_out("greeting2");
                call_out("greeting2", 1, me);
        } else
        {
                remove_call_out("greeting");
                call_out("greeting", 1, me);
        }
}

void greeting(object me)
{
        if (objectp(me) && environment(me) == environment())
        {
                message_vision(CYN "$N" CYN "笑着对$n" CYN "说：你好，你是想打"
                               "造道具吗？\n" NOR, this_object(), me);
        }
}

void greeting2(object me)
{
        if (objectp(me) && environment(me) == environment())
        {
                message_vision(CYN "$N" CYN "对$n" CYN "说：交钱就可以打造了哦"
                               "。\n" NOR, this_object(), me);
        }
}

int do_show(string arg)
{
        object  me;
        object  ob;
        string  msg;
        string  mat;
        int     power_point;
        int     value;
//      int     n;

        me = this_player();
        if (! arg)
                return notify_fail("你想干什么，是要跳个舞么？\n");

        mat = arg;
        power_point = 0;

        if (! objectp(ob = present(mat, me)))
                return notify_fail("算了吧，你身上没有 " + mat + " 这种东西。\n");

       if( ob->query("id") == "qiankun stone" )
        {
                message_vision(CYN "$N" CYN "对$n" CYN "说道：这可是炼制如意乾坤袋的材料，我可以"
                               "亲自为你炼制，只要五百两黄金。\n" NOR,
                               this_object(), me);
                return 1;
        }

        if (! ob->query("material_attrib"))
        {
                message_vision(CYN "$N" CYN "一愣，对$n" CYN "说道：这种东西也能"
                               "用来炼制，我没听说过。\n" NOR, this_object(), me);
                return 1;
        }

        power_point = ob->query("power_point");
        if (! power_point)
        {
                message_vision(CYN "$N" CYN "仔细的看了看$n" CYN "拿出的原料，叹"
                               "道：这样原料看来已经是锻造不了了。\n" NOR,
                               this_object(), me);
                return 1;
        }
        value = power_point * 2 + 20;
        msg = sprintf(CYN "$N" CYN "仔细看了看$n" CYN "拿出的原料，说道：这种原料"
                      "打造道具，只需要%s两黄金。要是没有问题，请给我原料并付钱。"
                      "\n" NOR, chinese_number(value));
        message_sort(msg, this_object(), me);

        return 1;
}

// 发出提示信息
int ask_me()
{
        message_sort(CYN "$N" CYN "对$n" CYN "说道：你是要打造自己的道具吗？我们这"
                     "里可以为你打造各种武器包括刀、剑、锤、鞭、杖和护甲。手艺绝对"
                     "是一流。你可以先把原料给我看看(" HIY "show" NOR + CYN ")，我"
                     "先估算一下价钱。如果你觉得满意就交钱。\n" NOR,
                     this_object(), this_player());
        return 1;
}

int no_money()
{
        object me;
        object ob;

        me = this_player();
        if (me->query_temp("item/status") == "item_gived")
        {
                message_vision(CYN "$N" CYN "打量了一下$n" CYN "道：既然没钱，那你"
                               "就等下次吧。\n" NOR, this_object(), me);

                if (objectp(ob = query_temp("item/accept")))
                {
                        message_vision(HIC "$N" HIC "随手把" + ob->name() + NOR + HIC
                                       "交还给$n" HIC "。\n" NOR, this_object(), me);

                        if (! ob->move(me))
                                ob->move(environment());
                }
                delete_temp("item");
                me->delete_temp("item");
                return 1;
        }

        message_vision(CYN "$N" CYN "眼睛一瞪，对$n" CYN "说道：没钱？你没钱关我啥"
                       "事，我又不是财神爷。\n" NOR, this_object(), me);
        return 1;
}

// 接受定金
int accept_object(object me, object ob)
{
        string status, filename, file;
        int    val;
        object depot_ob;

        status = query_temp("item/status");
        if (status == "look_working")
        {
                message_vision(CYN "$N" CYN "紧张的对$n" CYN "说：别吵，干将正在干"
                               "活呢。\n" NOR, this_object(), me);
                return 0;
        }

        if (status == "waiting")
        {
                if (query_temp("item/player_id") == me->query("id"))
                {
                        command("say 你好好和我夫君谈，少打岔。");
                        return 0;
                }

                message_vision(CYN "$N" CYN "对$n" CYN "说：你别吵，我夫君正在和顾"
                               "客谈话呢。\n" NOR, this_object(), me);
                return 0;
        }

        if (status == "accept")
        {
                if (query_temp("item/player_id") != me->query("id"))
                {
                        command("say 我正在和别的客人商量呢，你先别添乱！");
                        return 0;
                }

                if (! ob->query("money_id"))
                {
                        command("say 你还是快点交钱吧，要是没钱就明说！");
                        return 0;
                }
        }

        if( ob->query("id") == "qiankun stone" )
        {
                filename = ITEM_DIR + "depot/" + me->query("id");
                if (file_size(filename + ".c") > 0)
                {
                        message_vision("$N一呆，对$n道：你已经拥有如意乾坤袋了呀，直接召唤(summon)吧！。\n",
                                       this_object(), me);
                        me->set("can_summon/ruyi dai", filename);
                        return 0;
                }
                val = ob->query("value") / 60;
                message_vision(CYN "$N" CYN "对$n" CYN "说道：很好，炼制如意乾坤袋"
                               "需要" + chinese_number(val) + "两黄金。\n" NOR,
                               this_object(), me);
                val *= 10000;
                ob->set("item/value", val);
                me->set_temp("item/status", "item_gived");
                me->set_temp("item/value", val);
                set_temp("item/status", "accept");
                set_temp("item/player_id", me->query("id"));
                set_temp("item/accept", ob);

                // 如果过一段时间没有交款，还道具粗坯
                remove_call_out("time_out");
                call_out("time_out", 30, me, ob);
                return 1;
        }

        if (ob->query("material_attrib") &&
            ob->query("power_point"))
        {
                // 计算价值
                val = ob->query("power_point") * 2 + 20;
                message_vision(CYN "$N" CYN "对$n" CYN "说道：很好，用这块原料打造"
                               "道具需要" + chinese_number(val) + "两黄金。\n" NOR,
                               this_object(), me);
                val *= 10000;
                if (wizardp(me))
                {
                        message_vision(HIC "$N" HIC "仔细看了看$n" HIC "，笑着说道"
                                       "：原来是巫师啊，那么你随便给点好了。\n" NOR,
                                       this_object(), me);
                        val = 1;
                }
                ob->set("item/value", val);
                me->set_temp("item/status", "item_gived");
                me->set_temp("item/value", val);
                set_temp("item/status", "accept");
                set_temp("item/player_id", me->query("id"));
                set_temp("item/accept", ob);

                // 如果过一段时间没有交款，还道具粗坯
                remove_call_out("time_out");
                call_out("time_out", 30, me, ob);
                return 1;
        }

        if (ob->query("money_id"))
        {
                object origin;
                mixed p;
                string *types;

                if (me->query_temp("item/status") == "answer_type")
                {
                        message_vision(CYN "$N" CYN "摇摇头，对$n" CYN "说：快说你要"
                                       "做什么东西呀。\n" NOR, this_object(), me);
                        return 0;
                }

                if (me->query_temp("item/status") != "item_gived")
                {
                        message_vision(CYN "$N" CYN "把$n" CYN "递过去的" + ob->name() +
                                       CYN "推了回来，摇头道：无功不受禄。\n" NOR,
                                       this_object(), me);
                        return 0;
                }

                if (ob->value() < me->query_temp("item/value"))
                {
                        message_vision(CYN "$N" CYN "冷笑一声，对$n" CYN "说：本店开"
                                       "张千多年来，还没有打过折扣。\n" NOR,
                                       this_object(), me);
                        return 0;
                }

                origin = query_temp("item/accept");

                if (origin->query("id") == "qiankun stone")
                {
                        file = read_file(DEPOT_OB);

                        file = replace_string(file, "LONG_DESCRIPTION",
                                                HIB "如意乾坤袋上绣着一行小字：" + me->query("name") +
                                                "(" + me->query("id") +")。\n" NOR);

                        // give depot ob to me
                        filename = ITEM_DIR+"depot/" + me->query("id");
                        if (file_size(filename + ".c") > 0)
                        {
                                if (depot_ob = find_object(filename))
                                        destruct(depot_ob);

                                DBASE_D->clear_object(filename);
                                rm(filename + ".c");
                                //log_file("depot_ob",sprintf("%s have new depot ob.\n",query("id", me)));
                        }
                        assure_file(filename);
                        write_file(filename + ".c", file);
                        VERSION_D->append_sn(filename + ".c");
                        remove_call_out("time_out");
                        catch(call_other(filename, "???"));
                        depot_ob = find_object(filename);
                        if (! depot_ob)
                        {
                                delete_temp("item");
                                me->delete_temp("item");
                                message_vision("$N一呆，对$n道：抱歉抱歉！出了一些问题！材料我还是还你吧。\n",
                                               this_object(), me);
                                return 0;
                        }

                        depot_ob->move(me, 1);
                        depot_ob->save();
                        me->set("can_summon/ruyi dai", filename);
                        me->delete_temp("item");
                        delete_temp("item");
						message_vision(HIM "$N随手把" + origin->name() +
								   HIM "抛入炉内，霎时间，那" + origin->name() +
								   HIM "已被火炉中的熊熊" HIR "烈焰" HIM "吞没。\n" +
								   "$N又向炉中丢了一系列千奇百怪的材料一起熔炼。\n    ……\n"
								   "繁杂的炼制步骤看的$n眼花缭乱，可$n一点帮也忙不了，只能傻傻的等着。\n"
								   "    ……\n    ……\n    ……\n\n" NOR , this_object(), me);
                        tell_object(me, HIY "你获得了一个如意乾坤袋。\n" NOR);
                        ob->move(this_object());
                        destruct(origin);
                        return 1;
                }

                if ((p = origin->query("can_make")) == "all")
                {
                        types = keys(item_type);
                } else
                if (arrayp(p))
                        types = p;
                else
                if (stringp(p))
                        types = ({ p });

                p = origin->query("not_make");
                if (arrayp(p))
                        types -= p;
                else
                if (stringp(p))
                        types -= ({ p });

                set_temp("item/types", types);
                set_temp("item/money", ob);
                ob->move(this_object());

                message_vision(CYN "$N" CYN "对$n" CYN "说道：好，这就给你炼。你打算打"
                               "造什么东西，请告诉(" HIY "answer <类型>" NOR + CYN ")我"
                               "类型。\n" HIC "「" + implode(types, "、") + "」\n" NOR,
                               this_object(), me);

                me->set_temp("item/status", "answer_type");
                return -1;
        }

        message_vision(CYN "莫邪对$N" CYN "皱眉道：你给我这些东西干什么？\n" NOR, me);
        return 0;
}

int do_answer(string arg)
{
        object money;
        object ob;
        object me;
        object ganjiang;

        me = this_player();
        if (me->query_temp("item/status") != "answer_type")
                return 0;

        if (! arg)
                return notify_fail("你要回答什么？\n");

        message_vision(CYN "$n" CYN "对$N" CYN "道：就打造「" HIY + arg + NOR +
                       CYN "」吧！\n" NOR, this_object(), me);

        if (member_array(arg, query_temp("item/types")) == -1 ||
            undefinedp(item_type[arg]))
        {
                message_vision(CYN "$N" CYN "看了看$n" CYN "，有一搭没一搭的“"
                               "嗯”了一声。\n" NOR, this_object(), me);
                return 1;
        }

        // 如果干将不在
        if (! objectp(ganjiang = present("gan jiang")))
        {
                message_vision(CYN "$N" CYN "看了看四周，不禁一呆，说道：我夫君"
                               "呢？没他在就没办法做了……你改天再来吧。\n" NOR,
                               this_object());

                if (ob = query_temp("item/accept"))
                {
                        message_vision(CYN "$N" CYN "把" + ob->name() + NOR + CYN
                                       "交还给$n" CYN "。\n", this_object(), me);

                        if (! ob->move(me))
                                ob->move(environment());
                }
                delete_temp("item");
                me->delete_temp("item");
                return 0;
        }

        if (objectp(money = query_temp("item/money")))
                destruct(money);
        delete_temp("item/money");
        set_temp("item/status", "look_working");
        me->set_temp("item/status", "waiting");
        ob = query_temp("item/accept");
        ob->set("item/ctype", arg);
        ob->set("item/type", item_type[arg][ITEM_TYPE]);
        ob->set("item/stype", item_type[arg][ITEM_STYPE]);
        ob->set("item/unit", item_type[arg][ITEM_UNIT]);
        ob->set("item/point", ob->query("power_point") * item_type[arg][ITEM_POINT] / 100);
        ob->set("item/owner", me);
        ob->set("item/owner_id", me->query("id"));
        ob->set("item/owner_name", me->name(1));
        ob->set("item/wscale", item_type[arg][ITEM_WEIGHT]);
        ob->set("item/prop", item_type[arg][ITEM_PROP]);

        message_vision(HIC "$N" HIC "点了点头，把" + ob->name() + HIC "交给了$n"
                       HIC "。\n" NOR, this_object(), ganjiang);

        if (! ob->move(ganjiang))
                error("Can move the object to ganjiang.");
        remove_call_out("time_out");
        ganjiang->accept_object(this_object(), ob);
        return 1;
}

void time_out(object me, object ob)
{
        object money;
        int at_present;

        money = query_temp("item/money");

        if (! objectp(me))
                me = find_player(query_temp("item/player_id"));

        if (! objectp(me) || environment(me) != environment())
        {
                command("say 奇怪，刚才那位客人呢？怎么这就走了？\n");
                at_present = 0;
        } else
        {
                command("say 你慢慢犹豫吧，我可不能跟你耗着！想好再来吧！");
                at_present = 1;
        }

        delete_temp("item");
        if (objectp(me))
                me->delete_temp("item");

        if (money)
        {
                if (at_present)
                        command("give " + money->query("id") +
                                " to " + me->query("id"));

                if (environment(money) == this_object())
                        command("drop " + money->query("id"));
        }

        if (ob)
        {
                if (at_present)
                        command("give " + ob->query("id") +
                                " to " + me->query("id"));

                if (environment(ob) == this_object())
                        command("drop " + ob->query("id"));
        }
}