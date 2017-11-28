#include <ansi.h>
#include "gaibang.h"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;

#include "fight.h"

void create()
{
        set_name("梁长老", ({ "liang zhanglao", "liang", "zhanglao" }));
        set("long", @LONG
梁长老是丐帮出道最久，武功最高的长老，在
武林中享名已久。丐帮武功向来较强，近来梁
长老一力整顿，更是蒸蒸日上。
LONG);
        set("nickname", HIR "传功长老" NOR);
        set("title", "丐帮九袋长老");
        set("gender", "男性");
        set("age", 48);
        set("attitude", "peaceful");
        set("class", "beggar");

        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);

        set("max_qi", 4200);
        set("max_jing", 3200);
        set("neili", 4500);
        set("max_neili", 4500);
        set("jiali", 200);
        set("combat_exp", 2200000);
        set("score", 350000);
        set("shen_type", 1);
        
        set_skill("force", 240);
        set_skill("jiaohua-neigong", 220);
        set_skill("huntian-qigong", 240);
        set_skill("dodge", 240);
        set_skill("feiyan-zoubi", 240);
        set_skill("unarmed", 240);
        set_skill("changquan", 220);
        set_skill("jueming-tui", 240);
        set_skill("strike", 240);
        set_skill("tongchui-zhang", 240);
        set_skill("parry", 240);
        set_skill("staff", 240);
        set_skill("dagou-bang", 240);
        set_skill("jiaohua-bangfa", 240);
        set_skill("begging", 280);
        set_skill("checking", 280);
        set_skill("literate", 220);
        set_skill("martial-cognize", 240);

        map_skill("force", "huntian-qigong");
        map_skill("unarmed", "jueming-tui");
        map_skill("strike", "tongchui-zhang");
        map_skill("staff", "dagou-bang");
        map_skill("parry", "dagou-bang");
        map_skill("dodge", "feiyan-zoubi");

        prepare_skill("strike", "tongchui-zhang");
        prepare_skill("unarmed", "jueming-tui");

        create_family("丐帮", 18, "长老");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "staff.chan" :),
                (: perform_action, "staff.feng" :),
                (: perform_action, "staff.ban" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();
        carry_object("/d/gaibang/npc/obj/cloth")->wear();
        carry_object("/d/gaibang/npc/obj/staff")->wield();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("hmm");
        command("say 老夫只负责给低袋弟子传功，并不收徒。");
}
