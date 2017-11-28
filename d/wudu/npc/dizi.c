// dizi.c 五毒教弟子

inherit NPC;

void create()
{
        set_name("五毒教弟子", ({ "di zi", "dizi" }));
        set("age", 28);
        set("gender", "男性");
        set("long", "一个身体强壮的苗族青年，看来武功已小由所成。\n");
        set("attitude", "peaceful");
        set("max_qi", 500);

        set("str", 24);
        set("dex", 26);
        set("combat_exp", 20000);
        set("shen_type", -1);

        set_skill("unarmed", 40);
        set_skill("dodge", 40);
        set_skill("parry", 40);
        set_skill("sword", 40);
        set_skill("force", 40);
        set_temp("apply/attack", 40);
        set_temp("apply/defense", 40);
        set_temp("apply/damage", 20);
        set_temp("apply/armor", 40);

        setup();
        carry_object(__DIR__"obj/ganggou")->wield();
        carry_object(__DIR__"obj/jinyi")->wear();
}
