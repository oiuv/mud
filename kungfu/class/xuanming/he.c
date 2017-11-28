#include <ansi.h>
#include "xuanming.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

#define BI "/clone/lonely/hexingbi"

void create()
{
        set_name("鹤笔翁", ({ "hebi weng", "hebi", "weng" }));
	set("gender", "男性");
        set("shen_type", -1);
        set("age", 50);
        set("str", 30);
        set("con", 38);
        set("int", 20);
        set("dex", 26);
        set("max_qi", 4400);
        set("max_jing", 2200);
        set("qi", 4400);
        set("jing", 2200);
        set("neili", 5500);
        set("max_neili", 5500);
        set("jiali", 135);
        set("combat_exp", 1200000);

        set_skill("force", 260);
        set_skill("xuanming-shengong", 260);
        set_skill("minggu-xinfa", 260);
        set_skill("dodge", 240);
        set_skill("liuying-bu", 240);
        set_skill("dagger", 240);
        set_skill("jingyue-bifa", 260);
        set_skill("hexing-bifa", 260);
        set_skill("strike", 260);
        set_skill("feihua-zhang", 260);
        set_skill("xuanming-zhang", 260);
        set_skill("cuff", 260);
        set_skill("piaofeng-quan", 260);
        set_skill("parry", 240);
        set_skill("claw", 240);
        set_skill("dulong-shenzhua", 240);
        set_skill("literate", 220);
        set_skill("martial-cognize", 200);
        
        map_skill("dagger",  "hexing-bifa");
        map_skill("strike", "xuanming-zhang");
        map_skill("force",  "xuanming-shengong");
        map_skill("dodge",  "liuying-bu");
        map_skill("parry",  "xuanming-zhang");
        map_skill("cuff",  "piaofeng-quan");
        map_skill("claw",  "dulong-shenzhua");

        prepare_skill("strike", "xuanming-zhang");
             
        create_family("玄冥谷", 2, "弟子");

        set("no_teach", ([
                "xuanming-shengong" : "玄冥神功要我师父百损道人亲自传授。",
                "xuanming-zhang"    : "玄冥神掌要我师父亲自传授，你还是去找他老人家吧！",
                "dulong-shenzhua"   : "这个你还是找我师兄鹿杖客吧，他比我厉害多了！",
        ])); 

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({               
                (: perform_action, "strike.ying" :),
                (: perform_action, "strike.zhe" :),
                (: perform_action, "strike.lang" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set("inquiry", ([
                "张无忌"    :   "哼，臭小子屡次坏我大事！我非杀了他不可！\n",
                "赵敏"      :   "那丫头诡计多端，忘恩负义，枉我兄弟为她出生入死。\n",
                "百损道人"  :   "他是我恩师，你问这干什么？\n",
                "鹿杖客"    :   "他是我师兄，我们从小跟着师父学艺，亲同手足。\n", 
        ]));

        set_temp("apply/attack", 80);
        set_temp("apply/damage", 80);
        set_temp("apply/unarmed_damage", 80);
        set_temp("apply/armor", 80);

	set("coagents", ({
                ([ "startroom" : "xxxxxxxxxxxx",
                   "id"        : "baisun daoren" ]),
        }));

        setup();

        carry_object("/clone/cloth/baipao")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if (ob->query("family/master_name") == "鹿杖客")
        {
                command("say 你既然已得到我师兄指点，还是好好跟着他学吧！");
                return;
        }

        if ((int)ob->query("shen") > 0)
        {
                command("say 我玄冥谷向来不和你们这些正道人士交往。");
                command("say 你还是请回吧！");
                return;
        }

        command("nod");
        command("say 今日我就暂且收下你，日后定须刻苦练武。");
        command("recruit " + ob->query("id"));
}

int accept_ask(object me, string topic)
{
        switch (topic)
        {
        case "掌打飞花" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/feihua-zhang/fei",
                           "name"    : "掌打飞花",
                           "sk1"     : "feihua-zhang",
                           "lv1"     : 40,
                           "gongxian": 100,
                           "shen"    : -2000, ]));
                break;

        case "卷字决" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/piaofeng-quan/juan",
                           "name"    : "卷字决",
                           "sk1"     : "piaofeng-quan",
                           "lv1"     :  30,
                           "gongxian":  80,
                           "shen"    : -500, ]));
                break;

        case "残月刺" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/jingyue-bifa/ci",
                           "name"    : "残月刺",
                           "sk1"     : "jingyue-bifa",
                           "lv1"     : 30,
                           "gongxian": 200,
                           "shen"    : -2400, ]));
                break;

        case "内点乾坤" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/hexing-bifa/dian",
                           "name"    : "内点乾坤",
                           "sk1"     : "hexing-bifa",
                           "lv1"     : 100,
                           "gongxian": 320,
                           "shen"    : -8000, ]));
                break;

        case "如影相随" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/xuanming-zhang/ying",
                           "name"    : "如影相随",
                           "sk1"     : "xuanming-zhang",
                           "lv1"     :  100,
                           "dodge"   :  180,
                           "gongxian":  380,
                           "shen"    : -32000, ]));
                break;

         case "鹤形笔" :
                return MASTER_D->give_item(me, this_object(),
                               (["item"     :  BI,
                                 "master"   :  1,
                                 "sk1"      :  "hexing-bifa",
                                 "lv1"      :  100,
                                 "shen"     :  -10000 ]));
                  break;
        default:
                return 0;
        }
}

void unconcious()
{
        die();
}
