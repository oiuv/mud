#include <ansi.h>

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

void create()
{
        set_name("施令威", ({ "shi lingwei", "shi", "lingwei" }));
        set("long",
                "他就是隐居江湖数年的五路神施令威，现在在梅庄当管家。\n"
        );

        set("gender", "男性");
        set("nickname", HIR "五路神" NOR);
        set("title", "梅庄仆从");
        set("attitude", "friendly");

        set("age", 30);
        set("str", 25);
        set("int", 25);
        set("con", 25);
        set("dex", 25);
        set("max_qi", 3000);
        set("max_jing", 2700);
        set("neili", 3500);
        set("max_neili", 3500);
        set("jiali", 50);
        set("combat_exp", 500000);

        set_skill("parry", 120);
        set_skill("wai-bagua", 120);
        set_skill("force", 120);
        set_skill("nei-bagua", 120);
        set_skill("bagua-xinfa", 120);
        set_skill("dodge", 120);
        set_skill("bagua-bu", 120);
        set_skill("blade", 140);
        set_skill("bagua-dao", 140);
        set_skill("strike", 120);
        set_skill("bagua-zhang", 120);
        set_skill("cuff", 120);
        set_skill("bagua-quan", 120);
        set_skill("literate", 100);

        map_skill("blade", "bagua-dao");
        map_skill("dodge", "bagua-bu");
        map_skill("force", "nei-bagua");
        map_skill("strike", "bagua-zhang");
        map_skill("cuff", "bagua-quan");
        map_skill("parry", "wai-bagua");

        prepare_skill("cuff", "bagua-quan");
        prepare_skill("strike", "bagua-zhang");

        set("coagents", ({
                ([ "startroom" : "/d/meizhuang/xiaowu",
                   "id"        : "huang zhonggong" ]),
        }));

        set("guarder", ([
                "refuse_other": CYN "$N" CYN "对$n" CYN "皱眉道："
                                "给我站住，前面是大庄主静修之地，"
                                "任何人不得打扰！" NOR,
                "refuse_carry": CYN "$N" CYN "对$n" CYN "喝道：你"
                                "背上背的是什么人？" NOR,
        ]));

        create_family("梅庄", 2, "仆从");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "blade.daomang" :),
                (: perform_action, "cuff.pigua" :),
                (: perform_action, "strike.ding" :),
                (: perform_action, "unarmed.you" :),
                (: perform_action, "parry.zhen" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }) );

        setup();

        carry_object("/d/city/npc/obj/cloth")->wear();
        carry_object("/d/city/npc/obj/gangdao")->wield();
}

void attempt_apprentice(object ob)
{
        message_vision(CYN "$N" CYN "摇了摇头，对$n" CYN "道：我"
                       "不收徒，你若要拜师，去找丁兄好了。\n" NOR,
                       this_object(), ob);
}
