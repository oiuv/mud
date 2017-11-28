inherit NPC;
inherit F_GUARDER;

string ask_me();

void create()
{
        set_name("出尘子", ({ "chuchen zi", "chuchen" }));
        set("nickname", "星宿派八师兄");
        set("long", 
                "他就是丁春秋的八弟子出尘子。\n"
                "他身才矮胖，可手中握的钢杖又长又重。\n");
        set("gender", "男性");
        set("age", 25);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("class", "fighter");
        set("str", 30);
        set("int", 12);
        set("con", 28);
        set("dex", 28);
        
        set("max_qi", 1700);
        set("max_jing", 800);
        set("neili", 2200);
        set("max_neili", 2200);
        set("jiali", 22);
        set("combat_exp", 180000);

        set_skill("force", 120);
        set_skill("huagong-dafa", 120);
        set_skill("dodge", 50);
        set_skill("zhaixing-gong", 50);
        set_skill("claw", 50);
        set_skill("sanyin-wugongzhao", 50);
        set_skill("strike", 50);
        set_skill("chousui-zhang", 50);
        set_skill("parry", 120);
        set_skill("staff", 120);
        set_skill("tianshan-zhang", 120);

        map_skill("force", "huagong-dafa");
        map_skill("dodge", "zhaixinggong");
        map_skill("strike", "chousui-zhang");
        map_skill("claw", "sanyin-wugongzhao");
        map_skill("parry", "tianshan-zhang");
        map_skill("staff", "tianshan-zhang");
        prepare_skill("strike", "chousui-zhang");
        prepare_skill("claw", "sanyin-wugongzhao");

        create_family("星宿派", 2, "弟子");

        set("coagents", ({
                ([ "startroom" : "/d/xingxiu/riyuedong",
                   "id"        : "ding chunqiu" ]),
        }));
        
        setup();
        carry_object("/clone/weapon/gangzhang")->wield();

}

void attempt_apprentice(object ob)
{
        command("say 老仙还没允许我收徒呢。");
}
