#include <ansi.h>

inherit NPC;
inherit F_UNIQUE;
inherit F_COAGENT;

void create()
{
        set_name("徐子陵", ({ "xu ziling", "xu", "ziling"}));
        set("long", "一个俊俏的白衣少年，他就是名震天下的徐子陵。\n"); 
        set("nickname", HIR "大唐双龙" NOR);
        set("title", HIY "大宗师" NOR);
        set("gender", "男性");
        set("age", 26);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);
        set("per", 35);

        set("max_qi", 7000);
        set("max_jing", 5000);
        set("max_neili", 9000);
        set("neili", 9000);
        set("jiali", 250);
        set("combat_exp", 8000000);

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "hand.jie" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
        }) );
        /*
        set_skill("dodge", 320);
        set_skill("hand", 320);
        set_skill("parry", 320);
        set_skill("unarmed", 320);
        set_skill("shou-yin", 320);
        set_skill("wudu-shu", 320);
        set_skill("force", 400);
        set_skill("changsheng-jue", 400);
        set_skill("blade", 240);
        set_skill("badao-daofa", 240);
        set_skill("literate", 100);

        map_skill("force", "changsheng-jue");
        map_skill("blade", "badao-daofa");
        map_skill("dodge", "wudu-shu");
        map_skill("parry", "shou-yin");
        map_skill("hand", "shou-yin");
        map_skill("unarmed", "shou-yin");

        prepare_skill("hand", "shou-yin");
        */
        setup();

        carry_object(__DIR__"obj/cloth1")->wear();
        carry_object(__DIR__"obj/hands")->wear();
        // carry_object("/kungfu/class/sky/obj/yishu");
        // carry_object("/kungfu/class/sky/obj/sheli");
}

void kill_ob (object ob)
{
        object me = this_object();
        object where = environment (me);
        object guard = present ("kou zhong", where);

        set_temp("my_killer", ob);
        ::kill_ob(ob);
        if (guard && !guard->is_fighting())
         {
                 message_vision (CYN "$N大怒道：阁下欺人太甚，别怪我无情！\n" NOR, guard);
                 guard->kill_ob(ob);
         }
}

