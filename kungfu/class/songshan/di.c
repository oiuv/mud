#include <ansi.h>
#include "songshan.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

void create()
{
        set_name("狄修", ({ "di xiu", "xiu", "di" }) );
        set("gender", "男性");
        set("class", "swordsman");
        set("age", 25);
        set("attitude", "peaceful");
        set("str", 26);
        set("con", 30);
        set("dex", 30);
        set("int", 28);

        set("neili", 1000);
        set("max_neili", 1000);
        set("jiali", 30);
        set("max_qi",1000);
        set("max_jing",1800);
        set("combat_exp", 90000);
        set("shen_type", 1);

        set_skill("cuff", 60);
        set_skill("songshan-quan", 60); 
        set_skill("strike", 60);    
        set_skill("songshan-zhang", 60); 
        set_skill("sword", 80);
        set_skill("songshan-jian", 80);
        set_skill("force", 80);
        set_skill("parry", 60);
        set_skill("dodge", 60);
        set_skill("songshan-jian", 80);
        set_skill("lingxu-bu", 60);
        set_skill("songshan-xinfa", 80);
        set_skill("literate", 80);
        set_skill("martial-cognize", 60);

        map_skill("force", "songshan-xinfa");
        map_skill("sword", "songshan-jian");
        map_skill("parry", "songshan-jian");
        map_skill("cuff", "songshan-quan");
        map_skill("strike", "songshan-zhang");
        map_skill("dodge", "lingxu-bu");

        prepare_skill("strike", "songshan-zhang");
        prepare_skill("strike", "songshan-quan");

        create_family("嵩山派", 14, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.meng" :),
                (: perform_action, "strike.po" :),
		(: perform_action, "cuff.chui" :),
                (: exert_function, "recover" :),
        }));

        set("coagents", ({
                ([ "startroom" : "/d/songshan/xxxxxxxx",
                   "id"        : "zuo lengchan" ]),
        }));

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") < 0)
        {
                command("say 你这人不做好事，我嵩山派可容你不得。");
                return;
        }

        command("say 既然如此，那你以后就跟着我吧。");
        command("recruit " + ob->query("id"));
}

int accept_ask(object me, string topic)
{
        switch (topic)
        {
        case "千斤锤" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/songshan-quan/chui",
                           "name"    : "千斤锤",
                           "sk1"     : "songshan-quan",
                           "lv1"     : 30,
                           "force"   : 30,
                           "gongxian": 60,
                           "shen"    : 2000, ]));
                break;

        case "破山斧" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/songshan-zhang/po",
                           "name"    : "破山斧",
                           "sk1"     : "songshan-zhang",
                           "lv1"     : 30,
                           "force"   : 30,
                           "gongxian": 60,
                           "shen"    : 2000, ]));
                break;

        case "如梦如幻" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/songshan-jian/meng",
                           "name"    : "如梦如幻",
                           "sk1"     : "songshan-jian",
                           "lv1"     : 40,
                           "gongxian": 80,
                           "shen"    : 2800, ]));
                break;

        default:
                return 0;
        }
}

void unconcious()
{
        die();
}
