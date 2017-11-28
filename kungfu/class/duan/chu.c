#include <ansi.h>
#include "duan.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

void create()
{
        set_name("褚万里", ({ "chu wanli", "chu" }));
        set("title", "大理国护卫" );
        set("long", "他是大理国四大护卫之一，英气逼人。\n");
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
        set_skill("whip", 140);
        set_skill("feifeng-bian", 140);
        set_skill("parry", 120);
        set_skill("literate", 80);
        set_skill("martial-cognize", 140);

        map_skill("force", "duanshi-xinfa");
        map_skill("dodge", "tiannan-bu");
        map_skill("cuff", "jinyu-quan");
        map_skill("strike", "wuluo-zhang");
        map_skill("whip", "feifeng-bian");
        map_skill("parry", "feifeng-bian");

        prepare_skill("cuff", "jinyu-quan");
        prepare_skill("strike", "wuluo-zhang");

        set("coagents", ({
                ([ "startroom" : "/d/dali/neitang",
                   "id"        : "duan zhengchun", ]),
        }));

        set("guarder", ([
                "refuse_home" : CYN "$N" CYN "拦住$n" CYN "道：对不"
                                "起！王爷有令，出了段家就莫回来。\n" NOR,
                "refuse_other": CYN "$N" CYN "一把拦住$n" CYN "，喝"
                                "道：闲杂人等，不能入内。\n" NOR,
                "refuse_carry": CYN "$N" CYN "陪着笑脸对$n" CYN "道"
                                "：可否将…你背的人放下再进王府？\n" NOR,
        ]));

        create_family("段氏皇族", 15, "家臣");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "whip.xi" :),
                (: perform_action, "cuff.man" :),
                (: perform_action, "strike.bian" :),
                (: exert_function, "recover" :),
        }));

        setup();
        carry_object("/d/dali/npc/obj/junfu")->wear();
        carry_object("/d/dali/npc/obj/diaogan")->wield();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("shake");
        command("say 世子殿下何需如此，只要有事吩咐在下一声便是。");
        return;
}