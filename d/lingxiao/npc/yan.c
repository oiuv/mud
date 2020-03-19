#include <ansi.h>

inherit NPC;
inherit F_GUARDER;

void create()
{
        set_name("燕万鹏", ({"yan wanpeng", "yan", "wanpeng"}));
        set("gender", "男性");
        set("age", 20);
        set("long", "他是凌霄城第六代弟子燕万鹏。第六代弟子中，为\n"
                    "人数他最为梗直，素有铁面之称，所以在此镇狱。\n");
        set("age", 24);
        set("attitude", "peaceful");

        set("str", 25);
        set("con", 30);
        set("int", 24);
        set("dex", 30);

        set("max_qi", 3000);
        set("max_jing", 2500);
        set("neili", 2500);
        set("max_neili", 2500);
        set("jiali", 120);
        set("combat_exp", 1000000);

        set_skill("force", 160);
        set_skill("xueshan-neigong", 160);
        set_skill("dodge", 140);
        set_skill("taxue-wuhen", 140);
        set_skill("cuff", 140);
        set_skill("lingxiao-quan", 140);
        set_skill("strike", 140);
        set_skill("piaoxu-zhang", 140);
        set_skill("sword", 160);
        set_skill("hanmei-jian", 160);
        set_skill("yunhe-jian", 160);
        set_skill("parry", 140);
        set_skill("literate", 100);
        set_skill("martial-cognize", 60);

        map_skill("force", "xueshan-neigong");
        map_skill("dodge", "taxue-wuhen");
        map_skill("cuff", "lingxiao-quan");
        map_skill("strike", "piaoxu-zhang");
        map_skill("sword", "yunhe-jian");
        map_skill("parry", "hanmei-jian");

        prepare_skill("strike", "piaoxu-zhang");
        prepare_skill("cuff", "lingxiao-quan");

        set("coagents", ({
                ([ "startroom" : "/d/lingxiao/dilao",
                   "id"        : "bai zizai" ]),
        }));

        set("guarder", ([
                "refuse_other": CYN "$N" CYN "对$n" CYN "喝道："
                                "阁下请止步，下面乃我凌宵宫的禁"
                                "地，外人不得入内！" NOR,
                "refuse_carry": CYN "$N" CYN "对$n" CYN "喝道：你"
                                "背上背的是什么人？快给我放下来"
                                "！" NOR,
        ]));

        create_family("凌霄城", 6, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.chong" :),
                (: perform_action, "cuff.jue" :),
                (: perform_action, "strike.piao" :),
                (: exert_function, "recover" :),
        }));

        setup();
        carry_object("/clone/weapon/changjian")->wear();
        carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        command("say 我有要事在身，你去找我其它师兄弟们好了。");
}
