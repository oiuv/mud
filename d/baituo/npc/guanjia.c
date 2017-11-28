inherit NPC;

void create()
{
        set_name("管家", ({ "guan jia", "guan", "jia" }));
        set("gender", "男性" );
        set("age", 30);
        set("long", "一个管家。\n");
        set("shen_type", -1);
        set("combat_exp", 20000);
        set("str", 24);
        set("dex", 22);
        set("con", 23);
        set("int", 20);
        set("attitude", "friendly");
        set("max_qi", 200);
        set("max_jing", 200);
        set("neili", 200);
        set("max_neili", 200);
        set("score", 2500);

        set_skill("force", 22);
        set_skill("dodge", 23);
        set_skill("unarmed", 22);
        set_skill("parry", 24);
        set_temp("apply/attack", 15);
        set_temp("apply/defense", 14);
        set_temp("apply/damage", 15);
        set_temp("apply/armor", 10);

        setup();
        carry_object("/d/baituo/obj/baipao")->wear();
        carry_object("/d/baituo/obj/key");
}
