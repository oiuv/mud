inherit NPC;

void create()
{
        set_name("小翠", ({"xiao cui", "xiao", "cui"}) );
        set("gender", "女性" );
        set("age", 12+random(6));
        set("long", "这是个年龄不大的小姑娘，便过去加茶倒水。\n");
        set("attitude", "friendly");
        set("shen_type", 1);
        set("class", "taoist");

        set("str", 20);
        set("int", 28);
        set("con", 24);
        set("dex", 20);

        set("max_qi", 150);
        set("max_jing", 100);
        set("neili", 150);
        set("max_neili", 150);

        set("combat_exp", 1000);
        set("score", 1000);
        set("tea_count", 5);

        set_skill("force", 30);
        set_skill("dodge", 20);
        set_skill("unarmed", 15+random(10));
        set_skill("parry", 20);
        set_temp("apply/attack", 10);
        set_temp("apply/defense", 15);
        set_temp("apply/damage", 3);

        create_family("武当派", 5, "茶童");

        setup();
        carry_object("/d/wudang/obj/greenrobe")->wear();
        carry_object("/d/city/obj/necklace");
}

