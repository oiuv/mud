inherit NPC;

void create()
{
        set_name("素斋师傅",({"suzhai shifu", "shifu", "suzhai"}));
        set("long", "在寺庙中烧饭的和尚。\n" );
        set("gender", "男性");
        set("attitude", "peace");

        set("age", 43);
        set("mingwang", 100);
        set("str", 20);
        set("int", 16);
        set("con", 20);
        set("max_qi", 500);
        set("combat_exp", 6000);

        set_skill("force", 30);
        set_skill("unarmed",30);
        set_skill("blade", 30);
        set_skill("dodge", 30);
        set_skill("parry", 30);
        set_skill("literate",30);

        setup();
        carry_object(__DIR__"obj/xuan-cloth")->wear();
        carry_object(__DIR__"obj/caidao")->wield();
        add_money("coin", 50);
}
