#include <ansi.h>
inherit NPC;

#include "fight.h"

void create()                                                                   
{
        NPC_D->generate_cn_name(this_object());
        set("gender", "男性");
        set("long", "这是位衣着破烂的丐帮弟子，眉目间透出股英气。\n");
        set("title", "丐帮六袋弟子");
        set("age", 38);
        set("attitude", "peaceful");
        set("class", "beggar");

        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        set("max_qi", 1800);
        set("max_jing", 1200);
        set("neili", 1600);
        set("max_neili", 1600);
        set("jiali", 150);
        set("combat_exp", 500000);

        set_skill("force", 150);
        set_skill("jiaohua-neigong", 150);
        set_skill("dodge", 150);
        set_skill("feiyan-zoubi", 150);
        set_skill("staff", 150);
        set_skill("fengmo-zhang", 150);
        set_skill("unarmed", 150);
        set_skill("jueming-tui", 150);
        set_skill("strike", 150);
        set_skill("tongchui-zhang", 150);
        set_skill("parry", 150);
        set_skill("begging", 180);
        set_skill("checking", 180);
        set_skill("literate", 130);
        set_skill("martial-cognize", 130);

        map_skill("force", "jiaohua-neigong");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("staff", "fengmo-zhang");
        map_skill("strike", "tongchui-zhang");
        map_skill("unarmed", "jueming-tui");
        map_skill("parry", "fengmo-zhang");

        prepare_skill("strike", "tongchui-zhang");
        prepare_skill("unarmed", "jueming-tui");

        create_family("丐帮", 20, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "strike.kai" :),
                (: perform_action, "unarmed.jue" :),
                (: perform_action, "staff.luan" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 150);

        setup();

        carry_object(__DIR__"obj/staff")->wield();
        carry_object(__DIR__"obj/cloth")->wear();
}
