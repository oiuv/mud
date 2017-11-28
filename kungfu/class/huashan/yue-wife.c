// yue-wife.c    changed by cocacola on 2.19.1997 Just for adding Chushi
// 岳夫人
// modify by rcwiz 2003

inherit NPC;
inherit F_MASTER;

#include "qizong.h"

void create()
{
        set_name("岳夫人", ({ "yue wife", "ning", "ning zhongze" }) );
        set("nickname", "淑女剑");
        set("gender", "女性");
        set("class", "swordsman");
        set("age", 50);
        set("long", "岳夫人原姓宁，闺名宁中则，"
                    "是岳不群的师妹，也是他的妻子。\n");
        set("attitude", "peaceful");
        set("shen_type", 1);

        set("str", 24);
        set("int", 25);
        set("con", 23);
        set("dex", 22);

        set("max_qi", 3000);
        set("max_jing",1500);
        set("neili", 3700);
        set("max_neili", 3700);
        set("jiali", 30);
        set("combat_exp", 720000);

        set("apprentice_available", 3);

        set_skill("unarmed", 240);
        set_skill("cuff", 240);
        set_skill("strike", 240);
        set_skill("sword", 260);
        set_skill("blade", 260);
        set_skill("force", 260);
        set_skill("parry", 240);
        set_skill("dodge", 240);
        set_skill("literate", 180);
        set_skill("huashan-jian", 260);
        set_skill("shunv-jian", 260);
        set_skill("fanliangyi-dao", 260);
        set_skill("huashan-xinfa", 260);
        set_skill("huashan-quan", 240);
        set_skill("poyu-quan", 240);
        set_skill("huashan-zhang", 240);
        set_skill("hunyuan-zhang", 240);
        set_skill("huashan-shenfa", 240); 
        set_skill("martial-cognize", 200);

        map_skill("sword", "shunv-jian");
        map_skill("parry", "shunv-jian");
        map_skill("blade", "fanliangyi-dao");
        map_skill("force", "huashan-xinfa");
        map_skill("cuff", "poyu-quan");
        map_skill("strike", "hunyuan-zhang");
        map_skill("dodge", "huashan-shenfa");

        prepare_skill("strike", "hunyuan-zhang");
        prepare_skill("cuff", "poyu-quan");

        set_temp("apply/attack", 220);
        set_temp("apply/dodge", 220);
        set_temp("apply/parry", 200);
        set_temp("apply/damage", 150);
        set_temp("apply/unarmed_damage", 150);
        set_temp("apply/armor", 200);

        create_family("华山派", 13, "掌门夫人");

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "sword.ning" :),
		(: perform_action, "strike.wuji" :),
		(: perform_action, "cuff.lei" :),
		(: perform_action, "cuff.po" :),
		(: exert_function, "recover" :),
	}));

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        if( query("apprentice_available") ) {
                if( find_call_out("do_recruit") != -1 )
                        command("say 慢著，一个一个来。");
                else
                        call_out("do_recruit", 2, ob);
        } else {
                command("say 今天好累哟。");
        }
}

void do_recruit(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((string)ob->query("gender") != "女性")
	{
                command("say 这位"+RANK_D->query_respect(ob) + "你还是找我师哥去吧.");
                return;
        }

        if (ob->query("shen") < 20000)
        {
                command("say 你行侠仗义的事还做得不够，我还不能收你！");
                return;
        }
 
        if (ob->query_skill("huashan-xinfa", 1) < 140)
        {
                command("say 我华山派以修气为主，你连本门心法都还不熟练，我不能收你！");
                return;
        }
      
        if (ob->query_skill("huashan-jian", 1) < 140)
        {
                command("say 你华山剑法还不够熟练，下去多练习练习再来找我吧！");
                return;
        }        

        command("say 微笑道：好，好，只要你用心学，他日必有成就。");
        command("recruit " + ob->query("id") );
}

int recruit_apprentice(object ob)
{
        if (::recruit_apprentice(ob))
                ob->set("class", "huashan");
        add("apprentice_availavble", -1);
}

void reset()
{
        set("apprentice_available", 3);
}

int accept_ask(object me, string topic)
{
        switch (topic)
        {
        case "历练" :
        case "历炼" :
        case "锻炼" :
                return QUEST_D->accept_ask(this_object(), me, topic);
                break;

        case "宁氏一剑" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/shunv-jian/ning",
                           "name"    : "宁氏一剑",
                           "sk1"     : "shunv-jian",
                           "lv1"     : 100,
                           "sk2"     : "force",
                           "lv2"     : 100,
                           "sk3"     : "dodge",
                           "lv3"     : 100,                           
                           "gongxian": 600,
                           "shen"    : 30000, ]));
                break;

        default:
                return 0;
        }
}

void unconcious()
{
        die();
}


