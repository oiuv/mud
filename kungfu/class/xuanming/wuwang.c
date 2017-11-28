inherit NPC;
inherit F_GUARDER;

#include <ansi.h>

void create()
{
//      object ob;

        set_name("乌旺阿普", ({ "wuwang apu", "wuwang", "apu" }));
        set("gender", "男性");
        set("age", 21);
        set("long", @LONG
他是玄冥谷鹿杖客的弟子。
LONG);
        set("attitude", "friendly");
        set("str", 20);
        set("int", 20);
        set("con", 20);
        set("dex", 20);
        set("per", 10);
        set("shen_type", 1);

        set("qi", 3000);
        set("max_qi", 3000);
        set("jing", 1400);
        set("max_jing", 1400);
        set("neili", 4000);
        set("max_neili", 4000);
        set("jiali", 100);

        set("combat_exp", 500000);

        set_skill("force", 80);
        set_skill("minggu-xinfa", 80);
        set_skill("dodge", 80);
        set_skill("liuying-bu", 80);
        set_skill("parry", 60);
        set_skill("feihua-zhang", 80);
        set_skill("piaofeng-quan", 80);
        set_skill("strike", 80);
        set_skill("cuff", 60);
        set_skill("literate", 40);
        set_skill("martial-cognize", 20);

        map_skill("force", "minggu-xinfa");
        map_skill("dodge", "lingying-bu");
        map_skill("parry", "feihua-zhang");
        map_skill("cuff", "piaofeng-quan");
        map_skill("strike", "feihua-diwang");

        prepare_skill("strike", "feihua-zhang");
        prepare_skill("cuff", "piaofeng-quan");

        create_family("玄冥谷", 3, "弟子");

	set("coagents", ({
                ([ "startroom" : "xxxxxxxxxxxxxxxxxxxxxxxx",
                   "id"        : "baisun daoren" ]),
        }));

        set("inquiry", ([
                "鹿杖客"   : "他是我师父，你找他干什么？\n",
                "玄冥神掌" : "那是我师父的绝技，天下无敌。\n",
        ]));

        set_temp("apply/attack", 50);
        set_temp("apply/defense", 50);
        set_temp("apply/damage", 10);
        set_temp("apply/unarmed_damage", 10);
        set_temp("apply/armor", 20);

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: exert_function, "recover" :),
                (: perform_action, "cuff.juan" :),
                (: perform_action, "strike.fei" :),
        }) );

        setup();

        carry_object("/clone/cloth/cloth")->wear();

}

void attempt_apprentice(object ob)
{
        command("say 要入玄冥谷，你还是找我师父或者师伯吧！\n");
        return;
}

void unconcious()
{
        die();
}