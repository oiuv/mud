#include <ansi.h>
#include "duan.h"

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("傅思归", ({ "fu sigui", "fu", "sigui" }));
        set("title", "大理国护卫" );
        set("long", "他是大理国四大护卫之一。\n");
        set("gender", "男性");
        set("age", 40);
        set("class", "officer");
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 30);
        set("int", 20);
        set("con", 25);
        set("dex", 25);

        set("max_qi", 1800);
        set("max_jing", 1000);
        set("neili", 2200);
        set("max_neili", 2200);
        set("jiali", 50);
        set("combat_exp", 500000);
        set("score", 5000);

        set_skill("force", 120);
        set_skill("duanshi-xinfa", 120);
        set_skill("dodge", 120);
        set_skill("tiannan-bu", 120);
        set_skill("cuff", 120);
        set_skill("jinyu-quan", 120);
        set_skill("strike", 120);
        set_skill("wuluo-zhang", 120);
        set_skill("club", 140);
        set_skill("jinyuan-gun", 140);
        set_skill("parry", 120);
        set_skill("literate", 80);
        set_skill("martial-cognize", 140);

        map_skill("force", "duanshi-xinfa");
        map_skill("dodge", "tiannan-bu");
        map_skill("cuff", "jinyu-quan");
        map_skill("strike", "wuluo-zhang");
        map_skill("club", "jinyuan-gun");
        map_skill("parry", "jinyuan-gun");

        prepare_skill("cuff", "jinyu-quan");
        prepare_skill("strike", "wuluo-zhang");

        create_family("段氏皇族", 15, "家臣");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "club.qian" :),
                (: perform_action, "cuff.man" :),
                (: perform_action, "strike.bian" :),
                (: exert_function, "recover" :),
        }));

        setup();
        carry_object("/d/dali/npc/obj/junfu")->wear();
        carry_object("/d/heimuya/npc/obj/shutonggun")->wield();
        add_money("silver", 10);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("ah");
        command("say 世子殿下何需如此，只要有事吩咐在下一声便是。");
        return;
}