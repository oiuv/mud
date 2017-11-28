inherit NPC;
inherit F_GUARDER;

void create()
{
        set_name("ÐÇËÞµÜ×Ó", ({ "xingxiu dizi", "dizi"}));
        set("gender", "ÄÐÐÔ");
        set("age", 16);
        set("attitude", "peaceful");
        set("class", "fighter");
        set("shen_type", -1);
        set("str", 18);
        set("int", 28);
        set("con", 20);
        set("dex", 24);
        
        set("max_qi", 300);
        set("max_jing", 300);
        set("neili", 500);
        set("max_neili", 500);
        set("jiali", 10);
        set("combat_exp", 45000);

        set_skill("force", 60);
        set_skill("guixi-gong", 60);
        set_skill("huagong-dafa", 20);
        set_skill("dodge", 40);
        set_skill("zhaixing-gong", 40);
        set_skill("strike", 40);
        set_skill("chousui-zhang", 40);
        set_skill("claw", 40);
        set_skill("sanyin-wugongzhao", 40);
        set_skill("whip", 80);
        set_skill("chanhun-suo", 80);
        set_skill("parry", 40);
        set_skill("poison", 50);
        set_skill("staff", 10);
        set_skill("tianshan-zhang", 10);

        map_skill("force", "guixi-gong");
        map_skill("dodge", "zhaixinggong");
        map_skill("strike", "chousui-zhang");
        map_skill("claw", "sanyin-wugongzhao");
        map_skill("parry", "tianshan-zhang");
        map_skill("staff", "tianshan-zhang");
        map_skill("whip", "chanhun-suo");

        prepare_skill("strike", "chousui-zhang");
        prepare_skill("claw", "sanyin-wugongzhao");

        create_family("ÐÇËÞÅÉ", 3, "µÜ×Ó");

        set("coagents", ({
                ([ "startroom" : "/d/xingxiu/riyuedong",
                   "id"        : "ding chunqiu", ]),
        }));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "whip.suo" :),
                (: exert_function, "recover" :),
        }) );

        setup();

        carry_object("/clone/weapon/changbian")->wield();
}


