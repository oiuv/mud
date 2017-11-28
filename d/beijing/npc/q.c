inherit NPC;

void create()
{
        set_name("戏子", ({ "xi zi", "xi", "zi" }) );
        set("gender", "男性" );
        set("age", 32);
        set("long",
              "一个在戏院唱戏的戏子。\n");
        set("shen_type", -1);
        set("combat_exp", 2501235);
        set("max_qi", 1);
        set("qi", 1);
        set("str", 1);
        set("dex", 1);
        set("con", 1);
        set("int", 1);
        set("attitude", "peaceful");
        
        setup();
        carry_object("/d/beijing/npc/obj/cloth")->wear();
        add_money("coin", 30);
}

