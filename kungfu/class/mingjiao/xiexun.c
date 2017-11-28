// XieXun.c
// by rcwiz 2003 for yhonline

#include <ansi.h>
#include "mingjiao.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;
inherit F_COAGENT;

void create()
{
	set_name("谢逊", ({"xie xun", "xie", "xun", }));
	set("long",
        "他是一位身材魁伟异常的的老者，身穿一件白布长袍。\n"
        "他满头黄发，威风凛凛，真如天神一般，只是两只眼睛并不睁开。\n"
	);

	set("title",HIR "明教" HIY "金毛狮王" NOR);
	set("gender", "男性");
	set("attitude", "peaceful");

	set("age", 61);
	set("shen_type", 1);
	set("per", 23);
	set("str", 40);
	set("int", 30);
	set("con", 40);
	set("dex", 30);

	set("max_qi", 6500);
	set("max_jing", 2500);
	set("neili", 7000);
	set("max_neili", 7000);
	set("jiali", 210);

	set("combat_exp", 3900000);
	set("score", 800000);

	set_skill("force", 280);
    	set_skill("dodge", 260); 
	set_skill("parry", 260);
	set_skill("hand", 280);
	set_skill("cuff", 280);
    	set_skill("shenghuo-xinfa", 280);
      	set_skill("shenghuo-bu", 260);
      	set_skill("pili-shou", 280);
	set_skill("pili-quan", 280);
	set_skill("qishang-quan", 280);
      	set_skill("literate", 240);
        set_skill("martial-cognize", 220);

    	map_skill("force", "shenghuo-xinfa");
    	map_skill("dodge", "shenghuo-bu");
    	map_skill("hand", "pili-shou");
    	map_skill("parry", "qishang-quan");
        map_skill("cuff", "qishang-quan");

	prepare_skill("cuff", "qishang-quan");

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: command("perform cuff.shang") :),
		(: command("perform cuff.fei") :),
	}) );
	create_family("明教", 36, "弟子");

        set_temp("apply/attack", 150);
        set_temp("apply/damage", 150);
        set_temp("apply/unarmed_damage", 150);
        set_temp("apply/armor", 150);

	set("coagents", ({
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "zhang wuji" ]),
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "fan yao" ]),
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "dai jisi" ]),
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "weiyi xiao" ]),
                ([ "startroom" : "/d/mingjiao/dadian",
                   "id"        : "yin tianzheng" ]),
        }));
	setup();
    	carry_object("/d/mingjiao/obj/baipao")->wear();
}
/*
int accept_object(object who, object ob)
{
        if ((string)ob->query("id") == "yi xin")
	{
		say("谢逊说道：谢谢你终于让我知道了阳教主的下落，我"
		    "们明教上下无不感激！\n");
	}
	return 1;
}
*/

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") < 40000)
        {
                command("say 你行侠仗义的事做得还不够，还是请回吧。");
                return;
        }
      
        if (ob->query_skill("shenghuo-xinfa", 1) < 140)
        {       
                command("say 你圣火心法不够娴熟，还是下去多练习一下吧！");
                return ;
        }

        if (ob->query("combat_exp") < 380000)
        {
                command("say 你江湖经验不足，还是多磨练一下吧！");
                return;
        }

        command("nod");
        command("say 好，好，今日我就收你为弟子。");
        command("recruit " + ob->query("id"));
}

int accept_ask(object me, string topic)
{
        switch (topic)
        {

        case "天地混元" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/pili-shou/hun",
                           "name"    : "天地混元",
                           "sk1"     : "pili-shou",
                           "lv1"     : 140,
                           "force"   : 240,
                           "gongxian": 550,
                           "shen"    : 48000, ]));
                break;

        case "伤字诀" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/qishang-quan/shang",
                           "name"    : "伤字诀",
                           "sk1"     : "qishang-quan",
                           "lv1"     : 120,
                           "force"   : 180,
                           "gongxian": 550,
                           "shen"    : 48000, ]));
                break;

        case "魂魄飞扬" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/qishang-quan/fei",
                           "name"    : "魂魄飞扬",
                           "sk1"     : "qishang-quan",
                           "lv1"     : 160,
                           "force"   : 260,
                           "gongxian": 850,
                           "shen"    : 68000, ]));
                break;


        default:
                return 0;
        }
}

void unconcious()
{
        die();
}




