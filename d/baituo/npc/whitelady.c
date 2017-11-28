inherit NPC;

void create()
{
        set_name("白衣少女", ({ "shao nv", "shao", "nv" }));
        set("gender", "女性" );
        set("age", 18);
        set("long", "这是一个聪明伶俐的白衣少女。\n");
        set("shen_type", -1);
        set("combat_exp", 1000);
        set("str", 20);
        set("dex", 18);
        set("con", 19);
        set("int", 20);
        set("attitude", "friendly");
        set("max_qi", 100);
        set("max_jing", 100);
        set("neili", 100);
        set("max_neili", 100);
        set("score", 800);

        set_skill("force", 20);
        set_skill("dodge", 20);
        set_skill("unarmed", 20);
        set_skill("parry", 20);

        set_temp("apply/attack", 8);
        set_temp("apply/defense", 12);
        set_temp("apply/damage", 11);
        set_temp("apply/armor", 7);

        setup();
        carry_object("/d/baituo/obj/baipao")->wear();
}
