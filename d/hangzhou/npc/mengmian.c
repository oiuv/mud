// mengmian.c
inherit NPC;

void create()
{
        set_name("蒙面人", ({"mengmianren"}));
        set("long", "一个蒙面大汉，杀气腾腾。\n" );

        set("gender", "男性");
        set("attitude", "peace");

        set("chat_chance", 10);
        set("chat_msg",({
                (: this_object(), "random_move" :),
        }));

        set("age", 38);
        set("shen_type", 1);
        set("str", 25);
        set("int", 20);
        set("con", 20);
        set("dex", 25);
        set("max_qi", 500);
        set("max_jing", 100);
        set("neili", 500);
        set("max_neili", 500);
        set("jiali", 100);
        set("combat_exp", 20000);
        set("score", 100);
        set("apply/attack",  30);
        set("apply/defense", 30);

        set_skill("force", 50);
        set_skill("unarmed", 50);
        set_skill("blade", 50);
        set_skill("dodge", 50);
        set_skill("parry", 50);
        set_skill("shaolin-shenfa", 50);
        set_skill("cibei-dao", 50);
        set_skill("hunyuan-yiqi", 50);

        map_skill("force", "hunyuan-yiqi");
        map_skill("dodge", "shaolin-shenfa");
        map_skill("blade", "cibei-dao");
        map_skill("parry", "cibei-dao");

        setup();
        carry_object("/d/city/obj/gangdao")->wield();
        carry_object("/clone/misc/cloth")->wear();
        add_money("coin", 50);
}

