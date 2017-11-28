#include <ansi.h>
#include "songshan.h"

#define CANYANG "/clone/lonely/canyang"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;
inherit F_COAGENT;

void create()
{
        object ob;

        set_name("左冷禅", ({ "zuo lengchan", "zuo" }) );
        set("title", HIR"五岳剑派盟主"HIY"嵩山派第十三代掌门"NOR);
        set("gender", "男性");
        set("class", "swordsman");
        set("age", 55);
        set("attitude", "peaceful");
        set("str", 36);
        set("con", 33);
        set("dex", 30);
        set("int", 28);

        set("max_qi",5500);
        set("max_jing",2200);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 220);
        set("combat_exp", 1850000);
        set("shen_type", -1);

        set_skill("cuff", 240);
        set_skill("strike", 260);       
        set_skill("sword", 260);
        set_skill("force", 280);
        set_skill("parry", 240);
        set_skill("dodge", 240);
        set_skill("lingxu-bu", 240);
        set_skill("songshan-jian", 260);
        set_skill("lingyun-jian", 260);
        set_skill("chuanyue-jian", 260);
        set_skill("jiuqu-jian", 260);
        set_skill("poyang-jian", 260);      
        set_skill("songshan-xinfa", 280);
        set_skill("hanbing-zhenqi", 280);
        set_skill("hanbing-zhang", 260);
        set_skill("songshan-zhang", 260);
        set_skill("songshan-quan", 240);
        set_skill("literate", 220);
        set_skill("martial-cognize", 200);

        map_skill("force", "hanbing-zhenqi");
        map_skill("sword", "poyang-jian");
        map_skill("parry", "poyang-jian");
        map_skill("strike", "hanbing-zhang");
        map_skill("cuff", "songshan-quan");
        map_skill("dodge", "lingxu-bu");

        prepare_skill("strike", "hanbing-zhang");
             
        create_family("嵩山派", 13, "掌门");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.long" :),
                (: perform_action, "sword.xian" :),
                (: perform_action, "strike.hen" :),
                (: perform_action, "strike.han" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
                (: exert_function, "freezing" :)
        }));
     
        set_temp("apply/attack", 100);
        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();

        if (clonep())
        {
                ob = find_object(CANYANG);
                if (! ob) ob = load_object(CANYANG);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = new("/clone/weapon/changjian");
                        ob->move(this_object());
                        ob->wield();
                }
        }
        carry_object("/clone/cloth/cloth")->wear();
}


void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") > -30000)
        {
                command("say 我最看不惯你们这些侠义之士，你还是请回吧！");
                return;
        }

	if ((int)ob->query("combat_exp") < 360000)
	{
		command("say 你现在经验尚浅，还是多在江湖上走走吧。");
		return;
	}

        if ((int)ob->query_skill("songshan-jian", 1) < 160)
	{	
		command("say 我嵩山剑派乃五岳剑派之一，最为重视剑法。");
		command("say 你的嵩山剑法还不够熟练，下去练练再来吧。");
        	return;
        }
   
        if ((int)ob->query_skill("songshan-xinfa", 1) < 160)
	{
		command("say 我嵩山剑派虽善用剑，但内功却是御剑之本。");
		command("say 你是否还应该在嵩山心法上多下点功夫？");
		return;
 	} 

	command("haha");
        command("say 孺子可教，孺子可教。今日我就收下你吧。");
        command("say 你以后定要勤练武，扬我嵩山派雄风。");
        command("recruit " + ob->query("id"));
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

        case "踏雪无痕" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/hanbing-zhang/hen",
                           "name"    : "踏雪无痕",
                           "sk1"     : "hanbing-zhang",
                           "lv1"     : 100,
                           "force"   : 160,
                           "gongxian": 550,
                           "shen"    : -32000, ]));
                break;

        case "极天寒掌" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/hanbing-zhang/han",
                           "name"    : "极天寒掌",
                           "sk1"     : "hanbing-zhang",
                           "lv1"     : 120,
                           "force"   : 200,
                           "gongxian": 750,
                           "shen"    : -48000, ]));
                break;

        case "神光再现" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/poyang-jian/xian",
                           "name"    : "神光再现",
                           "sk1"     : "poyang-jian",
                           "lv1"     : 100,
                           "dodge"   : 140,
                           "gongxian": 650,
                           "shen"    : -54000, ]));
                break;

        case "天外玉龙" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/poyang-jian/long",
                           "name"    : "天外玉龙",
                           "sk1"     : "poyang-jian",
                           "lv1"     : 120,
                           "force"   : 180,
                           "gongxian": 900,
                           "shen"    : -72000, ]));
                break;


        case "寒冰真气" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/hanbing-zhenqi/freezing",
                           "name"    : "寒冰真气",
                           "sk1"     : "hanbing-zhenqi",
                           "lv1"     : 80,
                           "force"   : 140,
                           "gongxian": 1500,
                           "shen"    : -93000, ]));
                break;

        case "残阳宝剑" :
                return MASTER_D->give_item(me, this_object(),
                        ([ "item"    : CANYANG,
                           "master"  : 1,
                           "sk1"     : "songshan-jian",
                           "lv1"     : 120,
                           "shen"    : -20000, ]));
                break;
        default:
                return 0;
        }
}

