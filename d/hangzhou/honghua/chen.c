// chen.c 陈家洛

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("陈家洛", ({ "chen jialuo", "chen","jialuo" }));
        set("title", HIR "红花会总舵主" NOR);
        set("long", 
"他一副模样直是个富贵人家的纨裤子弟，丰姿如玉，目朗似星，轻
袍缓带，手中摇着一柄折扇，神采飞扬，气度闲雅，吐属斯文。服
饰俨然是个贵介公子。\n");
        set("nickname", HIW"玉面神龙"NOR);
        set("gender", "男性");
        set("class", "scholar");
        set("age", 22);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("per", 30);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        
        set("max_qi", 3500);
        set("max_jing", 1200);
        set("neili", 3000);
        set("max_neili", 3000);
        set("jiali", 150);
        set("combat_exp", 2000000);
        set("score", 500000);

        set_skill("literate", 200);
        set_skill("force", 250);
        set_skill("dodge", 250);
        set_skill("unarmed", 250);
        set_skill("parry", 250);
        set_skill("cuff", 250);
        set_skill("strike", 250);
        set_skill("hand", 250);
        set_skill("claw", 250);
        set_skill("yunlong-xinfa", 250);
        set_skill("yunlong-shengong", 250);
        set_skill("yunlong-shenfa", 250);
        set_skill("baihua-quan", 250);

        map_skill("dodge", "yunlong-shenfa");
        map_skill("force", "yunlong-shengong");
        map_skill("unarmed", "baihua-quan");
        map_skill("hand", "baihua-quan");
        map_skill("parry", "baihua-quan");
        map_skill("claw", "baihua-quan");
        map_skill("strike", "baihua-quan");
        map_skill("cuff", "baihua-quan");

        prepare_skill("unarmed","baihua-quan");

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: perform_action, "unarmed.cuo" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );

        setup();
        carry_object("/clone/cloth/jinduan")->wear();
        carry_object("/clone/cloth/yaodai")->wear();
}

