#include <ansi.h>
inherit NPC;

#include "fight.h"

void create()                                                                   
{
        NPC_D->generate_cn_name(this_object());
        set("gender", "男性");
        set("long", "这是位衣着破烂的丐帮弟子，眉目间透出股英气。\n");
        set("title", "丐帮四袋弟子");
        set("age", 30);
        set("attitude", "peaceful");
        set("class", "beggar");

        set("str", 25);
        set("int", 25);
        set("con", 25);
        set("dex", 25);
        set("max_qi", 1200);
        set("max_jing", 800);
        set("neili", 1300);
        set("max_neili", 1300);
        set("jiali", 100);
        set("combat_exp", 200000);

        set_skill("force", 120);
        set_skill("jiaohua-neigong", 120);
        set_skill("dodge", 100);
        set_skill("feiyan-zoubi", 100);
        set_skill("staff", 100);
        set_skill("jiaohua-bangfa", 100);
        set_skill("unarmed", 120);
        set_skill("jueming-tui", 120);
        set_skill("strike", 120);
        set_skill("tongchui-zhang", 120);
        set_skill("parry", 100);
        set_skill("begging", 140);
        set_skill("checking", 140);
        set_skill("literate", 80);
        set_skill("martial-cognize", 80);

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
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/damage", 60);
        set_temp("apply/unarmed_damage", 60);
        set_temp("apply/armor", 90);

        setup();
        carry_object(__DIR__"obj/cloth")->wear();
}
