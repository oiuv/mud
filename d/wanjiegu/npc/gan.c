// gan.c

inherit NPC;

void create()
{
        set_name("甘宝宝", ({ "gan baobao","gan","baobao" }) );
        set("gender", "女性" );
        set("age", 35);
        set("str", 16);
        set("con", 24);
        set("dex", 21);
        set("per", 27);
        set("int", 27);
        set("long",
        "甘宝宝容色清秀，多愁善感，年轻时曾与\n"
        "段正淳有过一段风流佳话，但段正淳未能\n"
        "与她共守白头，段正淳离去后，甘宝宝因\n"
        "有身孕，无奈嫁给钟万仇为妻。\n");

        set("attitude", "friendly");

        set("max_neili", 200);
        set("neili", 200);
        set("force_factor", 10);

        set("combat_exp", 35000);

        set_skill("finger", 60);
        set_skill("parry", 40);
        set_skill("dodge", 50);
        set_skill("sword", 30);
        set_skill("force", 50);
        set_skill("sun-finger",40);
        set_skill("yizhi-chan",60);

        map_skill("finger", "sun-finger");
        map_skill("parry", "sun-finger");

        setup();

        carry_object("/d/wanjiegu/npc/obj/red-dress")->wear();
        carry_object("/d/wanjiegu/npc/obj/shoes")->wear();
}

