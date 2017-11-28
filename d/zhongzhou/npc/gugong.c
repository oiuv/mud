inherit NPC;

void create()
{
        set_name("雇工", ({ "gu gong","gong"}) );
        set("gender", "男性" );
        set("age", 25);
        set("long", "年轻力壮的外地人。\n");
        set("attitude", "friendly");
        set("combat_exp", 8000);
        set("shen_type", 1);
        set_skill("unarmed", 45);
        set_skill("dodge", 45);
        set_skill("parry", 45);
        set_temp("apply/attack", 25);
        set_temp("apply/defense", 25);
        setup();
        carry_object("/clone/misc/cloth")->wear();
        add_money("coin",50);
}
