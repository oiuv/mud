#include <ansi.h>
inherit NPC;

#include "fight.h"

void create()                                                                   
{
        NPC_D->generate_cn_name(this_object());
        set("gender", "男性");
        set("long", "这是位丐帮七袋弟子，只见他身材魁梧，双目精光四射。\n");
        set("title", "丐帮七袋弟子");
        set("age", 38);
        set("attitude", "peaceful");
        set("class", "beggar");

        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        set("max_qi", 2000);
        set("max_jing", 1500);
        set("neili", 1800);
        set("max_neili", 1800);
        set("jiali", 160);
        set("combat_exp", 800000);

        set_skill("force", 160);
        set_skill("huntian-qigong", 160);
        set_skill("dodge", 160);
        set_skill("feiyan-zoubi", 160);
        set_skill("staff", 160);
        set_skill("fengmo-zhang", 160);
        set_skill("unarmed", 160);
        set_skill("jueming-tui", 160);
        set_skill("strike", 160);
        set_skill("tongchui-zhang", 160);
        set_skill("parry", 160);
        set_skill("begging", 200);
        set_skill("checking", 200);
        set_skill("literate", 150);
        set_skill("martial-cognize", 150);

        map_skill("force", "huntian-qigong");
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

        set_temp("apply/damage", 125);
        set_temp("apply/unarmed_damage", 125);
        set_temp("apply/armor", 180);

        setup();

        carry_object(__DIR__"obj/staff")->wield();
        carry_object(__DIR__"obj/cloth")->wear();
}
