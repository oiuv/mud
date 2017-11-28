#include <ansi.h>
inherit NPC;

#include "fight.h"

void create()                                                                   
{
        NPC_D->generate_cn_name(this_object());
        set("gender", "男性");
        set("long", "这是位衣着破烂的丐帮弟子，眉目间透出股英气。\n");
        set("title", "丐帮五袋弟子");
        set("age", 36);
        set("attitude", "peaceful");
        set("class", "beggar");

        set("str", 28);
        set("int", 28);
        set("con", 28);
        set("dex", 28);
        set("max_qi", 1500);
        set("max_jing", 1000);
        set("neili", 1500);
        set("max_neili", 1500);
        set("jiali", 130);
        set("combat_exp", 350000);

        set_skill("force", 140);
        set_skill("jiaohua-neigong", 140);
        set_skill("dodge", 120);
        set_skill("feiyan-zoubi", 120);
        set_skill("staff", 120);
        set_skill("jiaohua-bangfa", 120);
        set_skill("unarmed", 140);
        set_skill("jueming-tui", 140);
        set_skill("strike", 140);
        set_skill("tongchui-zhang", 140);
        set_skill("parry", 120);
        set_skill("begging", 160);
        set_skill("checking", 160);
        set_skill("literate", 120);
        set_skill("martial-cognize", 120);

        map_skill("force", "jiaohua-neigong");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("staff", "jiaohua-bangfa");
        map_skill("strike", "tongchui-zhang");
        map_skill("unarmed", "jueming-tui");
        map_skill("parry", "tongchui-zhang");

        prepare_skill("strike", "tongchui-zhang");
        prepare_skill("unarmed", "jueming-tui");

        create_family("丐帮", 20, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "strike.kai" :),
                (: perform_action, "unarmed.jue" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/damage", 80);
        set_temp("apply/unarmed_damage", 80);
        set_temp("apply/armor", 120);

        setup();
        carry_object(__DIR__"obj/cloth")->wear();
}
