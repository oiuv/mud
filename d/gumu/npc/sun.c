#include <ansi.h>

inherit NPC;
inherit F_GUARDER;

void create()
{
        set_name("孙婆婆", ({ "sun popo", "sun", "popo" }));
        set("gender", "女性");
        set("age", 55);

        set("long", "这是一位慈祥的老婆婆，正看着你微微一笑。\n");

        set("attitude", "friendly");

        set("qi", 1200);
        set("max_qi", 1200);
        set("jing", 400);
        set("max_jing", 400);
        set("neili", 1500);
        set("max_neili", 1500);
        set("jiali", 80);
        set("combat_exp", 150000);
        set("score", 0);

        set_skill("force", 160);
        set_skill("yunv-xinjing", 160);
        set_skill("sword", 140);
        set_skill("suxin-jue", 160);
        set_skill("dodge", 160);
        set_skill("yunv-shenfa", 160);
        set_skill("parry", 140);
        set_skill("unarmed", 140);
        set_skill("meinv-quan", 140);
        set_skill("literate", 140);
        set_skill("martial-cognize", 140);

        map_skill("force", "suxin-jue");
        map_skill("sword", "yunv-jian");
        map_skill("dodge", "yunv-shenfa");
        map_skill("parry", "yunv-jian");
        map_skill("unarmed", "meinv-quan");

        prepare_skill("unarmed", "meinv-quan");

        create_family("古墓派", 2, "弟子");

        set_temp("apply/attack", 50);
        set_temp("apply/defense", 50);
        set_temp("apply/damage", 60);
        set_temp("apply/unarmed_damage", 60);
        set_temp("apply/armor", 100);

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: command("perform unarmed.you") :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
                (: perform_action, "sword.mei" :),
        }) );

        set("env/wimpy", 50);

        set("coagents", ({
                ([ "startroom" : "/d/gumu/zhengting.c",
                   "id"        : "xiao longnv" ]),
        }));

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/misc/cloth")->wear();

}


