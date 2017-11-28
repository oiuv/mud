#include <ansi.h>
#include "songshan.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

void create()
{
        set_name("乐厚", ({ "yue hou", "hou", "yue" }) );
        set("nickname", HIY "大阴阳手" NOR);
        set("gender", "男性");
        set("class", "swordsman");
        set("age", 45);
        set("attitude", "peaceful");
        set("str", 26);
        set("con", 30);
        set("dex", 30);
        set("int", 28);

        set("neili", 2000);
        set("max_neili", 2000);
        set("jiali", 30);
        set("max_qi",2000);
        set("max_jing",1200);
        set("combat_exp", 70000);
        set("shen_type", 1);

        set_skill("cuff", 160);
        set_skill("strike", 160);       
        set_skill("sword", 160);
        set_skill("force", 160);
        set_skill("parry", 140);
        set_skill("dodge", 140);
        set_skill("songshan-jian", 160);
        set_skill("jiuqu-jian", 160);
        set_skill("lingxu-bu", 140);
        set_skill("songshan-xinfa", 160);
        set_skill("yinyang-zhang", 160);
        set_skill("songshan-zhang", 160);
        set_skill("songshan-quan", 160);
        set_skill("literate", 160);
        set_skill("martial-cognize", 120);

        map_skill("force", "songshan-xinfa");
        map_skill("sword", "jiuqu-jian");
        map_skill("parry", "jiuqu-jian");
        map_skill("strike", "yinyang-zhang");
        map_skill("cuff", "songshan-quan");
        map_skill("dodge", "lingxu-bu");

        create_family("嵩山派", 13, "护法");
        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.wan" :),
                (: perform_action, "strike.qian" :),
		(: perform_action, "cuff.chui" :),
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

        if ((int)ob->query("shen") < 3000)
        {
                command("say 你非侠义之辈，岂能入我嵩山剑派？");
                return;
        }

        if ((int)ob->query("combat_exp") < 22000)
        {
                command("say 你现在经验尚浅，还是多在江湖上走走吧。");
                return;
        }

        if ((int)ob->query_skill("songshan-jian", 1) < 40)
        {       
                command("hmm");
                command("say 你嵩山剑法练成这样，平时都干什么去了？");
                return;
        }
   
        if ((int)ob->query_skill("force") < 80)
        {
                command("say 你的内功心法太差，又能跟我学什么？");
                return;
        } 

        command("nod");
        command("say 我收下你便是，日后将我嵩山发扬光大。");
        command("recruit " + ob->query("id"));
}

int accept_ask(object me, string topic)
{
        switch (topic)
        {
        case "千掌环" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/yinyang-zhang/qian",
                           "name"    : "千掌环",
                           "sk1"     : "yinyang-zhang",
                           "lv1"     : 80,
                           "dodge"   : 80,
                           "gongxian": 220,
                           "shen"    : 3400, ]));
                break;

        case "九曲十八弯" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/jiuqu-jian/wan",
                           "name"    : "九曲十八弯",
                           "sk1"     : "jiuqu-jian",
                           "lv1"     : 80,
                           "dodge"   : 80,
                           "gongxian": 260,
                           "shen"    : 36000, ]));
                break;

        default:
                return 0;
        }
}

void unconcious()
{
        die();
}

