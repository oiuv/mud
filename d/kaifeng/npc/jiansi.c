inherit NPC;
void create()
{
        set_name("监寺僧人",({"jiansi seng"}));
        set("long", "他是一位身材高大的青年僧人，两臂粗壮，膀阔腰圆。他手持兵\n"
                    "刃，身穿一袭白布镶边袈裟，似乎有一身武艺。\n");
        set("gender", "男性");
        set("attitude", "aggressive");
        set("class", "bonze");

        set("age", 20);
        set("shen_type", 1);
        set("str", 20);
        set("int", 20);
        set("con", 20);
        set("dex", 20);
        set("max_qi", 1500);
        set("max_jing", 600);
        set("neili", 1000);
        set("max_neili", 1000);
        set("combat_exp", 150000);
        set("score", 100);

        set_skill("force", 80);
        set_skill("hunyuan-yiqi", 80);
        set_skill("dodge", 80);
        set_skill("shaolin-shenfa", 80);
        set_skill("unarmed", 80);
        set_skill("banruo-zhang", 80);
        set_skill("parry", 80);
        set_skill("blade", 80);
        set_skill("cibei-dao", 80);

        map_skill("force", "hunyuan-yiqi");
        map_skill("dodge", "shaolin-shenfa");
        map_skill("unarmed", "banruo-zhang");
        map_skill("parry", "cibei-dao");
        map_skill("blade", "cibei-dao");

        setup();
        carry_object("/d/shaolin/obj/jiedao")->wield();
        carry_object(__DIR__"obj/cheng-cloth")->wear();
}
