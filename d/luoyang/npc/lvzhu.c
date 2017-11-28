#include <ansi.h>

inherit NPC;

void create()
{
        set_name("ÂÌÖñÎÌ", ({ "lvzhu weng", "lv", "lvzhu", "weng"}));
        set("long", "Ëû±ãÊÇÂåÑô¶«³ÇµÄÂÌÖñÎÌ¡£\n"); 
        set("gender", "ÄÐÐÔ");
        set("age", 71);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 50);
        set("int", 50);
        set("con", 50);
        set("dex", 50);
        set("per", 50);

        set("max_qi", 4500);
        set("max_jing", 3000);
        set("max_neili", 5000);
        set("neili", 5000);
        set("jiali", 150);
        set("combat_exp", 1000000);

        set_skill("force", 220);
        set_skill("shenlong-xinfa", 220);
        set_skill("dodge", 220);
        set_skill("yixingbu", 220);
        set_skill("parry", 220);
        set_skill("shedao-qigong", 220);
        set_skill("unarmed", 220);
        set_skill("literate", 220);

        map_skill("force", "shenlong-xinfa");
        map_skill("dodge", "yixingbu");
        map_skill("parry", "shedao-qigong");
        map_skill("unarmed", "shedao-qigong");

        prepare_skill("unarmed", "shedao-qigong");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "unarmed.cui" :),
                (: perform_action, "unarmed.fei" :),
                (: perform_action, "unarmed.xian" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }));

        set_temp("apply/attack", 100);
        set_temp("apply/defense", 100);
        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 100);

        setup();
        carry_object("/clone/misc/cloth")->wear();
}

