#include <ansi.h>
#include "lingxiao.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

void create()
{
        set_name("陆万通", ({"lu wantong", "lu", "wantong"}));
        set("long", "陆万通是凌宵城雪山剑派中的六代弟子，只见他身\n"
                    "手矫健，双目如电。\n");
        set("gender", "男性");
        set("age", 34);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        set("max_qi", 4000);
        set("max_jing", 3000);
        set("neili", 2000);
        set("max_neili", 2000);
        set("jiali", 50);
        set("combat_exp", 500000);

        set_skill("force", 100);
        set_skill("xueshan-neigong", 100);
        set_skill("dodge", 100);
        set_skill("taxue-wuhen", 100);
        set_skill("cuff", 100);
        set_skill("lingxiao-quan", 100);
        set_skill("strike", 100);
        set_skill("piaoxu-zhang", 100);
        set_skill("sword", 120);
        set_skill("yunhe-jian", 120);
        set_skill("parry", 100);
        set_skill("literate", 100);
        set_skill("martial-cognize", 80);

        map_skill("force", "xueshan-neigong");
        map_skill("dodge", "taxue-wuhen");
        map_skill("cuff", "lingxiao-quan");
        map_skill("strike", "piaoxu-zhang");
        map_skill("sword", "yunhe-jian");
        map_skill("parry", "yunhe-jian");

        prepare_skill("strike", "piaoxu-zhang");
        prepare_skill("cuff", "lingxiao-quan");

        set("coagents", ({
                ([ "startroom" : "/d/lingxiao/qihan",
                   "id"        : "bai wanjian" ]),
        }));

        set("guarder", ([
                "refuse_other": CYN "$N" CYN "对$n" CYN "冷喝道："
                                "你给我站住！我们凌宵宫岂是由得外"
                                "人随便走动地方？" NOR,
                "refuse_carry": CYN "$N" CYN "对$n" CYN "喝道：你"
                                "背上背的是什么人？给我放下来！" NOR,
        ]));

        create_family("凌霄城", 6, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.chong" :),
                (: perform_action, "cuff.jue" :),
                (: perform_action, "strike.piao" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        setup();
        
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        command("say 很好，你以后就跟着我吧。");
        command("recruit " + me->query("id"));
}
