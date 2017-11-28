inherit NPC;
void create()
{
	set_name("智法长老", ({"zhifa zhanglao", "zhanglao"}));
        set("gender", "男性");
        set("attitude", "aggressive");
        set("class", "bonze");

        set("age", 20);
        set("shen_type", 1);
        set("str", 20);
        set("int", 20);
        set("con", 20);
        set("dex", 20);
        set("max_qi", 2500);
        set("max_jing", 1000);
        set("neili", 2000);
        set("max_neili", 2000);
        set("combat_exp", 500000);
        set("score", 1000);

        set_skill("force", 120);
        set_skill("hunyuan-yiqi", 120);
        set_skill("dodge", 120);
        set_skill("shaolin-shenfa", 120);
        set_skill("unarmed", 120);
        set_skill("banruo-zhang", 120);
        set_skill("parry", 120);
        set_skill("blade", 120);
        set_skill("cibei-dao", 120);

        map_skill("force", "hunyuan-yiqi");
        map_skill("dodge", "shaolin-shenfa");
        map_skill("unarmed", "banruo-zhang");
        map_skill("parry", "cibei-dao");
        map_skill("blade", "cibei-dao");

   	setup();
   	add_money("silver", 20);
	carry_object(__DIR__"obj/xuan-cloth")->wear();
}
