#include <ansi.h>
#include "xuanming.h"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;
inherit F_QUESTER;

void create()
{
        set_name("百损道人", ({ "baisun daoren", "baisun", "daoren" }));
        set("gender", "男性");
        set("long", @LONG
他就是玄冥谷开山祖师百损道人，只见他白发飘忽，双眼神光四射，令人敬畏。
LONG);
        set("shen_type", -1);
        set("age", 72);
        set("str", 40);
        set("con", 38);
        set("int", 40);
        set("dex", 46);
        set("max_qi", 7400);
        set("max_jing", 3400);
        set("qi", 7400);
        set("jing", 3400);
        set("neili", 8500);
        set("max_neili", 8500);
        set("jiali", 250);
        set("combat_exp", 3200000);

        set_skill("force", 320);
        set_skill("xuanming-shengong", 320);
        set_skill("minggu-xinfa", 300);
        set_skill("dodge", 300);
        set_skill("liuying-bu", 300);
        set_skill("strike", 320);
        set_skill("feihua-zhang", 320);
        set_skill("xuanming-zhang", 320);
        set_skill("cuff", 300);
        set_skill("piaofeng-quan", 300);
        set_skill("parry", 320);
        set_skill("claw", 320);
        set_skill("dulong-shenzhua", 320);
        set_skill("literate", 260);
        set_skill("martial-cognize", 220);
        
        map_skill("strike", "xuanming-zhang");
        map_skill("force",  "xuanming-shengong");
        map_skill("dodge",  "liuying-bu");
        map_skill("parry",  "xuanming-zhang");
        map_skill("cuff",  "piaofeng-quan");
        map_skill("claw", "dulong-shenzhua");

        prepare_skill("strike", "xuanming-zhang");
             
        create_family("玄冥谷", 1, "开山祖师");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({               
                (: perform_action, "strike.ying" :),
                (: perform_action, "strike.lang" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set("inquiry", ([
                "鹿杖客"    :   "他是我大徒弟。\n",
                "鹤笔翁"    :   "他是我小徒弟。\n", 
        ]));

        set_temp("apply/attack", 120);
        set_temp("apply/damage", 120);
        set_temp("apply/unarmed_damage", 120);
        set_temp("apply/armor", 120);

        setup();

        carry_object("/clone/cloth/baipao")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") > -35000)
        {
                command("say 哼，我百损道人从不和正道中人交往。");
                return;
        }        
    
        if (ob->query_skill("minggu-xinfa", 1) < 160)
        {
                command("say 你冥谷心法火候不足，还是跟我徒儿多练习练习吧！");
                return ;
        }
        
        if (ob->query_skill("strike", 1) < 160)
        {
                command("say 你基本掌法修为还不够，以后如何学习我玄冥谷绝学玄冥神掌？");
                return ;
        }

        if (ob->query("combat_exp") < 500000)
        {
                command("say 你江湖经验还不足，还是去多闯荡一下吧！");
                return;
        }

        command("nod");
        command("say 好，好，老夫今日就收下你。");
        command("haha");
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

        case "蛟龙抱" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/dulong-shenzhua/bao",
                           "name"    : "蛟龙抱",
                           "sk1"     : "dulong-shenzhua",
                           "lv1"     : 100,
                           "dodge"   : 150,
                           "gongxian": 420,
                           "shen"    : -38000, ]));
                break;

        case "真龙聚" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/dulong-shenzhua/ju",
                           "name"    : "真龙聚",
                           "sk1"     : "dulong-shenzhua",
                           "lv1"     :  130,
                           "force"   :  180,
                           "gongxian":  580,
                           "shen"    : -43000, ]));
                break;

        case "惊涛骇浪" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/xuanming-zhang/lang",
                           "name"    : "惊涛骇浪",
                           "sk1"     : "xuanming-zhang",
                           "lv1"     : 180,
                           "sk2"     : "xuanming-shengong",
                           "lv2"     : 180,
                           "neili"   : 3000,
                           "gongxian": 1200,
                           "shen"    : -68000, ]));
                break;

        default:
                return 0;
        }
}

void unconcious()
{
        die();
}
