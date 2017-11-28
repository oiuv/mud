#include <ansi.h>
#include "tiezhang.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

void create()
{
        set_name("司徒焚", ({ "situ fen", "situ", "fen"}));
        set("long", "一个四十来岁的中年男子，他便是铁掌帮二代人物\n"
                    "中的佼佼者，为人很是精明，深得帮助的喜爱。\n" );
        set("gender", "男性");
        set("age", 40);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 25);
        set("int", 25);
        set("con", 25);
        set("dex", 25);
       
        set("qi", 3500);
        set("max_qi", 3500);
        set("jing", 2000);
        set("max_jing", 2000);
        set("neili", 4000);
        set("max_neili", 4000);
        set("jiali", 120);
        set("combat_exp", 2000000);
        set("score", 40000);

        set_skill("force", 180);
        set_skill("tiezhang-xinfa", 200);
        set_skill("dodge", 200);
        set_skill("dengping-dushui", 200);
        set_skill("strike", 200);
        set_skill("parry", 200);
        set_skill("chuanxin-zhang", 200);
        set_skill("tongbi-zhang", 200);
        set_skill("cuff", 180);
        set_skill("tiexian-quan", 180);
        set_skill("unarmed", 180);
        set_skill("tiexue-dao", 180);
        set_skill("blade", 180);
        set_skill("literate", 160);
        set_skill("martial-cognize", 160);

        map_skill("force", "tiezhang-xinfa");
        map_skill("strike", "chuanxin-zhang");
        map_skill("cuff", "tiexian-quan");
        map_skill("parry", "chuanxin-zhang");
        map_skill("dodge", "dengping-dushui");
        map_skill("blade", "tiexue-dao");

        prepare_skill("strike", "chuanxin-zhang");
        prepare_skill("cuff", "tiexian-quan");

        set("coagents", ({
                ([ "startroom" : "/d/tiezhang/wztang",
                   "id"        : "qiu qianren" ]),
        }));

        create_family("铁掌帮", 14, "长老");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "blade.xue" :),
                (: perform_action, "cuff.kai" :),
                (: perform_action, "unarmed.zhui" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }) );

        setup();

        carry_object("/clone/misc/cloth")->wear();
        carry_object("/clone/weapon/gangdao")->wield();
        add_money("silver", 200);
}

void attempt_apprentice(object me)
{
//      string purename, name, new_name;

        if (! permit_recruit(me))
                return;

        if ( me->query("family/family_name") &&
             me->query("family/family_name") == "绝情谷" &&
             me->query("family/master_name") == "裘千尺" )
        {
                command("yi");
                command("say 原来阁下是裘千尺师叔的后裔，想来你和本帮有极深的渊源。");

                command("consider");
                command("say 这个事情我做不了主，你还是直接去找帮主吧。");

                me->set("move_party/绝情谷—铁掌帮", 1);
                return;
        }

        if ((int)me->query("shen") > -10000)
        {
                command("heng");
                command("say 你这样心慈手软可不行。");
                return;
        }

        if ((int)me->query("combat_exp") < 140000)
        {
                command("heng");
                command("say 你这点能力怎能成大器，还是练练再来吧！");
                return;
        }

        if ((int)me->query_skill("force") < 60)
        {
                command("say 学武之人最讲究内功精纯，我看你下的工夫还不够呀。");
                return;
        }

        if ((int)me->query_skill("strike", 1) < 40)
        {
                command("say 入帮之后连最基本的掌法都没练好，那你入铁掌帮作甚？");
                return;
        }

        command("say  既然这样，我便收下你，希望你苦练本帮神功，将之发扬光大。");

        command("recruit " + me->query("id"));
}

void init()
{
        object me, ob;
        mapping fam;

        ::init();

        ob = this_player();
        me = this_object();
        
        if (interactive(ob) 
            && ! environment(ob)->query("no_fight")
            && ! present("tiezhang ling", ob)
            && ! ob->query("move_party/绝情谷—铁掌帮", 1)
            && ( (fam = ob->query("family"))
            && fam["family_name"] != "铁掌帮" ) )
        {
                if( ob->query_temp("warned") < 3 )
                {
                        command("say 站住！你不是铁掌帮弟子，不能在此久留！");
                        command("say 你还是速速离开此地吧，不然我可要对你不客气了！！");
                        ob->add_temp("warned", 1);
                }
           else if( ob->query_temp("stay") < 3 )
                        ob->add_temp("stay", 1);
           else {
                        command("say 你活得不耐烦了，竟敢到铁掌帮来撒野！\n");
                        remove_call_out("hiting_ob");
                        call_out("hiting_ob", 1, ob);
                }
        }       
}

int hiting_ob(object ob)
{
        object me;
        me = this_object();
        ob->kill_ob(me);
        me->fight_ob(ob);
        remove_call_out("moving_ob");
        call_out("moving_ob",1,ob);
}

int accept_ask(object me, string topic)
{
        switch (topic)
        {
        case "血浪滔天" :
                return MASTER_D->teach_pfm(me, this_object(),
                          ([ "perform" : "can_perform/tiexue-dao/xue",
                           "name"    : "血浪滔天",
                           "msg1"    : HIY "$N" HIY "微微一笑，在你"
                                       "耳边轻声嘀咕了几句，然后顺"
                                       "手拔出腰间的刚刀凌空劈斩了"
                                       "几下，招式很是惊奇。你若有"
                                       "所悟的点了点头。",
                            "sk1"     : "tiexue-dao",
                           "lv1"     : 100,
                           "force"   : 60,
                           "gongxian": 60,
                           "shen"    : -15000, ]));
                break;

        case "穿心锥" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/chuanxin-zhang/zhui",
                           "name"    : "穿心锥",
                           "sk1"     : "chuanxin-zhang",
                           "lv1"     : 100,
                           "force"   : 150,
                           "dodge"   : 220,
                           "neili"   : 200,
                           "gongxian": 200,
                           "shen"    : -18000, ]));
                break;

        case "破甲推山" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/tiexian-quan/tui",
                           "name"    : "破甲推山",
                           "sk1"     : "tiexian-quan",
                           "lv1"     : 100,
                           "force"   : 90,
                           "neili"   : 400,
                           "gongxian": 260,
                           "shen"    : -23000, ]));
                break;

        case "穿心锥" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/chuanxin-zhang/zhui",
                           "name"    : "穿心锥",
                           "sk1"     : "chuanxin-zhang",
                           "lv1"     : 100,
                           "force"   : 150,
                           "dodge"   : 220,
                           "neili"   : 200,
                           "gongxian": 200,
                           "shen"    : -18000, ]));
                break;

        default:
                return 0;
        }
}
