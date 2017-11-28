#include <ansi.h>
inherit NPC;

void check_body();

void create()
{
        set_name("大悲老人", ({ "dabei laoren", "dabei", "laoren" }));
        set("long", "他是个红面老者，白发拂胸，甚是雄伟。\n");
        set("title", "白鲸岛岛主");
        set("gender", "男性");
        set("attitude", "friendly");
        set("age", 70);
        set("shen_type", 1);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("max_qi", 3500);
        set("max_jing", 3000);
        set("neili", 3800);
        set("max_neili", 3800);
        set("jiali", 100);
        set("combat_exp", 1000000);
        set("score", 500000);

        set_skill("force", 220);
        set_skill("luohan-fumogong", 220);
        set_skill("dodge", 200);
        set_skill("feiyan-zoubi", 200);
        set_skill("strike", 220);
        set_skill("dabei-zhang", 220);
        set_skill("parry", 220);
        set_skill("martial-cognize", 240);

        map_skill("force", "luohan-fumogong");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("strike", "dabei-zhang");
        map_skill("parry", "dabei-zhang");

        prepare_skill("strike", "dabei-zhang");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: check_body :),
        }));

        setup();

        carry_object("/clone/misc/cloth")->wear();
        if (random(2) == 1)
                carry_object("/clone/book/18niou");
}

void check_body()
{
        object me = this_object();

        if (me->query("eff_qi") > me->query("max_qi") * 2 / 3
           ||! objectp(present("18 niou", me)))
                return;

        message_vision(HIR "\n$N" HIR "红着双眼，暴怒道：天杀的，老"
                       "子今天豁出去了！\n" NOR, me);

        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/armor", 250);
        set_temp("apply/unarmed_damage", 250);

        set("qi", 4000);
        set("max_qi", 4000);
        set("eff_qi", 4000);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 200);

        set("chat_msg_combat", ({
                (: perform_action, "strike.bei" :),
                (: exert_function, "recover" :),
        }));
}
