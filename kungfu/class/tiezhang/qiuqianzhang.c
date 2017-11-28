#include <ansi.h>
#include "tiezhang.h"

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("裘千丈", ({ "qiu qianzhang", "qiu", "qianzhang", "zhang" }));
        set("long", "这是一个白须老头，身穿黄葛短衫，足穿麻鞋，右\n"
                    "手挥着一把大蒲扇。满脸的油滑无赖的表情。\n");

        set("gender", "男性");
        set("age", 60);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 23);
        set("int", 30);
        set("con", 26);
        set("dex", 25);
        set("env/wimpy", 70);
       
        set("max_qi", 1500);
        set("max_jing", 1500);
        set("neili", 2000);
        set("max_neili", 2000);
        set("jiali", 100);
        set("combat_exp", 100000);
        set("score", 40000);

        set_skill("force", 100);
        set_skill("tiezhang-xinfa", 100);
        set_skill("dodge", 120);
        set_skill("lingxu-bu", 120);
        set_skill("strike", 120);
        set_skill("parry", 120);
        set_skill("tongbi-zhang", 120);
        set_skill("tie-zhang", 120);
        set_skill("chuanxin-zhang", 120);
        set_skill("feilong-zhang", 120);
        set_skill("guyue-chan", 120);
        set_skill("staff", 100);
        set_skill("literate", 80);
        set_skill("martial-cognize", 80);

        map_skill("force", "tiezhang-xinfa");
        map_skill("strike", "tongbi-zhang");
        map_skill("parry", "tongbi-zhang");
        map_skill("dodge", "lingxu-bu");
        map_skill("staff", "feilong-zhang");

        prepare_skill("strike", "tongbi-zhang");

        set("no_teach", ([
                "tie-zhang" : "嘿嘿嘿，这玩意不厉害，我的通臂六合掌才是武林绝"
                              "学，你还是用心练这个吧。",
        ]));

        create_family("铁掌帮", 15, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "strike.chu" :),
                (: perform_action, "cuff.jia" :),
                (: perform_action, "staff.fei" :),
                (: exert_function, "recover" :),
        }) );

        
        set("inquiry", ([
                "name" : "记得先父曾给我起过一个名，叫甚么‘千丈’。我念着不好听，也就难得用它。\n",
                "here" : "这里就是铁掌帮的总坛所在，你如没事，不要四处乱走，免招杀身之祸！！！\n",
        ]));

        setup();

        carry_object("/clone/misc/cloth")->wear();
        carry_object("/clone/weapon/gangzhang")->wield();
        add_money("silver", 100);

        set("chat_chance", 10);
        set("chat_msg", ({
                CYN "裘千丈大大咧咧的说道：“铁掌帮上上下下的事情，没有爷爷不"
                "知道的！”\n" NOR,
                CYN "裘千丈神秘的说道：“一旦内功基础有成，就可以从花草树木"
                "中采气来提高了！”\n" NOR,
        }) );
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if ( me->query("family/family_name") &&
             me->query("family/family_name") == "绝情谷" &&
             me->query("family/master_name") == "裘千尺" )
        {
                command("yi");
                command("say 我道是谁，原来是三妹的弟子，我们本来就是一家人。");
                command("sigh");
                command("say 这个事情我做不了主，你还是去找二弟吧。");
                me->set("move_party/绝情谷—铁掌帮", 1);
                return;
        }

        if ((int)me->query("shen") > 0)
        {
                command("heng");
                command("say 他妈的！爷爷我最恨你这样心慈手软的小王八蛋！。");
                return;
        }

        command("say 爷爷我武功盖世，你这娃娃好好跟着我学，准没错！");
        command("recruit " + me->query("id"));
}

int accept_fight(object me)
{
        command("say " + RANK_D->query_respect(me) + "怕是活腻了，来来来，让爷爷教训教训你！\n");
        command("say 啊哟，糟糕，糟糕，这会儿当真不凑巧！你等一会，我肚子痛，要出恭！\n");
        return 0;
}

int accept_ask(object me, string topic)
{
        switch (topic)
        {
        case "孤雁出群" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/tongbi-zhang/chu",
                           "name"    : "孤雁出群",
                           "sk1"     : "tongbi-zhang",
                           "lv1"     : 80,
                           "force"   : 40,
                           "gongxian": 60,
                           "shen"    : -5000, ]));
                break;

        case "皓月惊空" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/guyue-chan/jing",
                           "name"    : "皓月惊空",
                           "sk1"     : "guyue-chan",
                           "lv1"     : 80,
                           "force"   : 40,
                           "gongxian": 80,
                           "shen"    : -8000, ]));
                break;

        case "龙飞势" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/feilong-zhang/fei",
                           "name"    : "龙飞势",
                           "sk1"     : "feilong-zhang",
                           "lv1"     : 160,
                           "force"   : 240,
                           "neili"   : 2500,
                           "gongxian": 400,
                           "shen"    : -20000, ]));
                break;

        default:
                return 0;
        }
}

void unconcious()
{
        die();
}
