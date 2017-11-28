#include <ansi.h>
#include "henshan.h"

#define ZHENYUE "/clone/lonely/zhenyue"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;
inherit F_COAGENT;

void create()
{
        object ob;
        set_name("莫大", ({ "mo da", "mo", "da" }));
        set("nickname", HIW "潇湘夜雨" NOR);
	set("gender", "男性");
        set("class", "swordman");
        set("attitude", "peaceful");
        set("shen_type", 1);

        set("age", 55);
        set("str", 28);
        set("con", 26);
        set("int", 28);
        set("dex", 28);
        set("max_qi", 5000);
        set("max_jing", 3000);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 200);
        set("combat_exp", 3000000);

        set_skill("force", 240);
        set_skill("henshan-xinfa", 240);   
	set_skill("zhenyue-jue", 240);
        set_skill("dodge", 240);
        set_skill("henshan-shenfa", 240);
        set_skill("cuff", 240);
        set_skill("henshan-quan", 240);
        set_skill("sword", 260);
        set_skill("henshan-jian", 260); 
        set_skill("tianzhu-jian", 260);
        set_skill("zigai-jian", 260);
        set_skill("furong-jian", 260);
        set_skill("shilin-jian", 260);
        set_skill("strike", 240);
        set_skill("biluo-zhang", 240);
        set_skill("liuyun-zhang", 240); 
        set_skill("parry", 240);
        set_skill("literate", 240);
	set_skill("tanqin-jifa", 300);
        set_skill("xiaoxiang-yeyu", 300);
        set_skill("martial-cognize", 220);

        map_skill("strike", "liuyun-zhang");
        map_skill("cuff", "henshan-quan");
        map_skill("sword", "shilin-jian");
        map_skill("force", "zhenyue-jue");
        map_skill("dodge", "henshan-shenfa");
        map_skill("parry", "shilin-jian");
	map_skill("tanqin-jifa", "xiaoxiang-yeyu");

        prepare_skill("strike", "liuyun-zhang");
             
        create_family("衡山派", 13, "掌门");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.luo" :),
                (: perform_action, "strike.pai" :),
		(: perform_action, "strike.die" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/attack", 100);
        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();

        if (clonep())
        {
                ob = find_object(ZHENYUE);
                if (! ob) ob = load_object(ZHENYUE);
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
        set_temp("handing", carry_object("/d/henshan/npc/obj/huqin"));
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") < 40000)
        {
                command("say 我衡山剑派乃是堂堂名门正派，对弟子要求严格。");
                command("say 你在这侠义与德行方面是否还做得不够？");
                return;
        }

        if ((int)ob->query("combat_exp") < 300000)
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
   
        if ((int)ob->query_skill("force") < 180)
        {
                command("say 我衡山剑派虽善用剑，但内功却是御剑之本。");
                command("say 你是否还应该在内功心法上多下点功夫？");
                return;
        } 

        command("nod");
        command("say 念你平时刻苦努力，今日我就收下你吧。");
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

        case "紫盖回翔" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/zigai-jian/hui",
                           "name"    : "紫盖回翔",
                           "sk1"     : "zigai-jian",
                           "lv1"     : 120,
                           "force"   : 150,
                           "dodge"   : 120,
                           "gongxian": 200,
                           "shen"    : 15000, ]));
                break;

        case "落英纷飞" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/shilin-jian/luo",
                           "name"    : "落英纷飞",
                           "sk1"     : "shilin-jian",
                           "lv1"     : 120,
                           "force"   : 180,
                           "gongxian": 500,
                           "shen"    : 50000, ]));
                break;

        case "流云叠影" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/liuyun-zhang/die",
                           "name"    : "流云叠影",
                           "msg1"    : "$N略微点点头，掌法陡然变快，"
                                       "双掌不断拍出，竟似如影如幻，"
                                       "似有三头六臂，直把你看得眼花"
                                       "缭乱。",
                           "sk1"     : "liuyun-zhang",
                           "lv1"     : 100,
                           "dodge"   : 150,
                           "gongxian": 300,
                           "shen"    : 50000, ]));
                break;

        case "排山倒海" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/liuyun-zhang/pai",
                           "name"    : "排山倒海",
                           "msg1"    : "$N点了点头，说道：“我给你演"
                                       "示一遍，可看好了。”说完$N便"
                                       "将内力运于掌风之中，双掌猛然"
                                       "拍出，雄浑有力，气势磅礴，毫"
                                       "无滞带。正是衡山派绝学「排山"
                                       "倒海」。",
                           "sk1"     : "liuyun-zhang",
                           "lv1"     : 140,
                           "force"   : 180,
                           "gongxian": 600,
                           "shen"    : 50000, ]));
                break;

        case "镇岳尚方" :
                return MASTER_D->give_item(me, this_object(),
                        ([ "item"    : ZHENYUE,
                           "master"  : 1,
                           "sk1"     : "henshan-jian",
                           "lv1"     : 120,
                           "shen"    : 50000, ]));
                break;
        default:
                return 0;
        }
}

void unconcious()
{
        die();
}
