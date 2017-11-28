#include <ansi.h>
#include "henshan.h"

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("鲁连荣", ({ "lu lianrong", "lu", "lianrong" }));
        set("gender", "男性" );
        set("nickname", HIY "金眼雕" NOR);
        set("class", "swordman");
        set("attitude", "peaceful");

        set("age", 45);
        set("str", 28);
        set("con", 26);
        set("int", 29);
        set("dex", 28);
        set("max_qi", 2800);
        set("max_jing", 1800);
        set("neili", 3000);
        set("max_neili", 3000);
        set("jiali", 150);
        set("combat_exp", 800000);

        set_skill("force", 140);
        set_skill("henshan-xinfa", 140);
        set_skill("zhenyue-jue", 100);
        set_skill("dodge", 140);
        set_skill("henshan-shenfa", 140);
        set_skill("cuff", 140);
        set_skill("henshan-quan", 140);
        set_skill("sword", 160);
        set_skill("henshan-jian", 160);
        set_skill("tianzhu-jian", 160);
        set_skill("zigai-jian", 140);
        set_skill("strike", 140);
        set_skill("biluo-zhang", 140); 
        set_skill("parry", 140);
        set_skill("literate", 140);
        set_skill("martial-cognize", 120);

        map_skill("strike", "biluo-zhang");
        map_skill("cuff", "henshan-quan");
        map_skill("sword", "tianzhu-jian");
        map_skill("force", "henshan-xinfa");
        map_skill("dodge", "henshan-shenfa");
        map_skill("parry", "henshan-jian");

        prepare_skill("cuff", "henshan-quan");
        prepare_skill("strike", "biluo-zhang");

        set("no_teach/zhenyue-jue", "这门内功我也是刚练不久，生疏得紧。");

        create_family("衡山派", 14, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.huan" :),
                (: perform_action, "cuff.riyue" :),
                (: perform_action, "strike.lian" :),
                (: exert_function, "recover" :),
        }));

        setup();
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") < 5000)
        {
                command("say 我衡山剑派乃是堂堂名门正派，对弟子要求严格。");
                command("say 你在这侠义与德行方面是否还做得不够？");
                return;
        }

        if ((int)ob->query("combat_exp") < 50000)
        {
                command("say 你现在经验尚浅，还是多在江湖上走走吧。");
                return;
        }

        if ((int)ob->query_skill("henshan-jian", 1) < 50)
        {       
                command("say 我衡山乃五岳剑派之一，最为重视剑法。");
                command("say 你的衡山剑法还不够熟练，下去练练再来吧。");
                return;
        }
   
        if ((int)ob->query_skill("force") < 100)
        {
                command("say 我衡山剑派虽善用剑，但内功却是御剑之本。");
                command("say 你是否还应该在内功心法上多下点功夫？");
                return;
        } 

        command("say 好吧，我就收下你。以后一定要更加努力。");
        command("recruit " + ob->query("id"));
}

int accept_ask(object me, string topic)
{
        switch (topic)
        {
        case "幻剑式" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/henshan-jian/huan",
                           "name"    : "幻剑式",
                           "sk1"     : "henshan-jian",
                           "msg1"    : "$N点了点头，喝道：“看清楚了"
                                       "。”话音刚落，便见$N突将体内"
                                       "真气运于剑身，身法陡然加快，"
                                       "手中长剑剑随人动如梦如幻，竟"
                                       "似无数利刃一齐袭出一般，招式"
                                       "甚为巧妙。",
                           "lv1"     : 60,
                           "force"   : 80,
                           "gongxian": 50,
                           "shen"    : 2000, ]));
                break;

        case "烟云锁身" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/tianzhu-jian/suo",
                           "name"    : "烟云锁身",
                           "sk1"     : "tianzhu-jian",
                           "lv1"     : 120,
                           "force"   : 150,
                           "dodge"   : 150,
                           "gongxian": 300,
                           "shen"    : 20000, ]));
                break;
        default:
                return 0;
        }
}
