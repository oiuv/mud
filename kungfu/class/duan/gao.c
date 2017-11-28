#include <ansi.h>
#include "duan.h"

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("高升泰", ({ "gao shengtai", "gao" }));
        set("title", "大理国宰相");
        set("nickname", HIR "善阐侯" NOR);
        set("long", @LONG
大理国侯爷，这是位宽袍大袖的中年男子，三缕长
髯，形貌高雅。
LONG);
        set("gender", "男性");
        set("age", 46);
        set("class", "officer");
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 30);
        set("int", 20);
        set("con", 25);
        set("dex", 25);
        set("max_qi", 4500);
        set("max_jing", 3000);
        set("neili", 5800);
        set("max_neili", 5800);
        set("jiali", 200);
        set("combat_exp", 2500000);
        set("score", 50000);

        set_skill("force", 200);
        set_skill("duanshi-xinfa", 200);
        set_skill("dodge", 200);
        set_skill("tiannan-bu", 200);
        set_skill("cuff", 200);
        set_skill("jinyu-quan", 200);
        set_skill("strike", 200);
        set_skill("wuluo-zhang", 200);
        set_skill("sword", 220);
        set_skill("duanjia-jian", 220);
        set_skill("parry", 200);
        set_skill("literate", 220);
        set_skill("martial-cognize", 200);

        map_skill("force", "duanshi-xinfa");
        map_skill("dodge", "tiannan-bu");
        map_skill("cuff", "jinyu-quan");
        map_skill("strike", "wuluo-zhang");
        map_skill("parry", "duanjia-jian");
        map_skill("sword", "duanjia-jian");

        prepare_skill("cuff", "jinyu-quan");
        prepare_skill("strike", "wuluo-zhang");

        create_family("段氏皇族", 15, "善阐侯");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "cuff.man" :),
                (: perform_action, "strike.bian" :),
                (: perform_action, "sword.jing" :),
                (: perform_action, "sword.lian" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        setup();

        carry_object("/d/dali/npc/obj/magcloth")->wear();
        carry_object("/d/dali/npc/obj/tiedi")->wield();
        add_money("silver", 20);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("haha");
        command("say 世子殿下何需如此，有事吩咐在下一声便是。");
        return;
}
