#include <ansi.h>
#include "henshan.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;
inherit F_COAGENT;

void create()
{
        set_name("刘正风", ({ "liu zhengfeng", "liu", "zhengfeng" }));
        set("nickname", HIR "落雁剑" NOR);
        set("gender", "男性" );
        set("class", "swordman");
        set("attitude", "peaceful");
        set("shen_type", 1);

        set("age", 45);
        set("str", 28);
        set("con", 26);
        set("int", 28);
        set("dex", 28);
        set("max_qi", 4500);
        set("max_jing", 2000);
        set("neili", 4000);
        set("max_neili", 4000);
        set("jiali", 150);
        set("combat_exp", 1800000);

        set_skill("force", 240);
        set_skill("henshan-xinfa", 240);
        set_skill("zhenyue-jue", 240);
        set_skill("dodge", 220);
        set_skill("henshan-shenfa", 220);
        set_skill("cuff", 220);
        set_skill("henshan-quan", 220);
        set_skill("sword", 240);
        set_skill("henshan-jian", 240);
        set_skill("tianzhu-jian", 240);
        set_skill("zigai-jian", 240);
        set_skill("furong-jian", 240);
        set_skill("shilin-jian", 240);
	set_skill("luoyan-jian", 240);
        set_skill("strike", 220);
        set_skill("biluo-zhang", 220);
        set_skill("liuyun-zhang" , 220);
        set_skill("parry", 220);
        set_skill("literate", 260);
	set_skill("tanqin-jifa", 280);
        set_skill("xiaoao-jianghu", 280);
	set_skill("guangling-san", 280);
        set_skill("martial-cognize", 220);

        map_skill("strike", "liuyun-zhang");
        map_skill("cuff", "henshan-quan");
        map_skill("sword", "luoyan-jian");
        map_skill("force", "zhenyue-jue");
        map_skill("dodge", "henshan-shenfa");
        map_skill("parry", "luoyan-jian");
	map_skill("tanqin-jifa", "xiaoao-jianghu");
	map_skill("tanqin-jifa", "xiaoao-jianghu");

        prepare_skill("strike", "liuyun-zhang");
             
        create_family("衡山派", 13, "名宿");

	set("no_teach", ([
		"liuyun-zhang" : "这流云掌向来只由掌门人亲授，你还是找我师兄传授吧！",
		"shilin-jian"  : "石廪剑法向来只由掌门人亲授，你还是找我师兄传授吧！",
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.luo" :),
                (: perform_action, "strike.pai" :),
		(: perform_action, "strike.ying" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));
     
        set("coagents", ({
                ([ "startroom" : "/d/henshan/furongfeng",
                   "id"        : "qu yang" ]),
        }));

        set_temp("apply/attack", 100);
        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
        set_temp("handing", carry_object("/d/henshan/npc/obj/tanmuqin"));
}


void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") < 30000)
        {
                command("say 我衡山剑派乃是堂堂名门正派，对弟子要求严格。");
                command("say 你在这侠义与德行方面是否还做得不够？");
                return;
        }

	if ((int)ob->query("combat_exp") < 200000)
	{
		command("say 你现在经验尚浅，还是多在江湖上走走吧。");
		return;
	}

        if ((int)ob->query_skill("henshan-jian", 1) < 120)
	{	
		command("say 我衡山乃五岳剑派之一，最为重视剑法。");
		command("say 你的衡山剑法还不够熟练，下去练练再来吧。");
        	return;
        }
   
        if ((int)ob->query_skill("force") < 150)
	{
		command("say 我衡山剑派虽善用剑，但内功却是御剑之本。");
		command("say 你是否还应该在内功心法上多下点功夫？");
		return;
 	} 

	command("haha");
        command("say 孺子可教，孺子可教。今日我就收下你吧。");
        command("say 你以后定要勤练武，多行善，扬我衡山派雄风。");
        command("recruit " + ob->query("id"));
}
 
int accept_ask(object me, string topic)
{
        switch (topic)
        {
        case "乱剑覆花" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/furong-jian/luan",
                           "name"    : "乱剑覆花",
                           "msg1"    : "$N点了点头，忽然一声轻啸，腾"
                                       "空而起，蓦地挽出一个剑花，顷"
                                       "刻间只见得剑花四散，洋洋洒洒"
                                       "，犹如无数花瓣从半空洒下，招"
                                       "式当真精奇无比。",
                           "sk1"     : "furong-jian",
                           "lv1"     : 100,
                           "force"   : 140,
                           "dodge"   : 140,
                           "neili"   : 1600,
                           "gongxian": 300,
                           "shen"    : 20000, ]));
                break;

        case "一剑落九雁" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/luoyan-jian/luo",
                           "name"    : "一剑落九雁",
                           "sk1"     : "luoyan-jian",
                           "lv1"     : 150,
                           "force"   : 220,
                           "dodge"   : 220,
                           "neili"   : 2800,
                           "gongxian": 1500,
                           "shen"    : 50000, ]));
                break;
        default:
                return 0;
        }
}

void init()
{
        string startroom;
        object ob;

        if (interactive(ob = this_player())
           && ! is_fighting())
        {
                if (! ob || environment(ob) != environment())
                        return;

                if (stringp(startroom = query("startroom"))
                   && find_object(startroom) == environment())
                        command("play xiaoao-jianghu");
                else
                        say(CYN + this_object()->name() +
                            CYN "深深地叹了口气。\n" NOR);
        }
        return;
}
