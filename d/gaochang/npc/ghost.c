inherit NPC;

void create()
{
        set_name("孤魂野鬼", ({ "ghost" }));
        set("long", "他看起来若有若无，缥缈不定。一身有说不出的诡异。\n");
        set("gender", "男性");
        set("attitude", "aggressive");
        set("age", 100);
        set("shen_type", 1);
        set("str", 20);
        set("int", 20);
        set("con", 20);
        set("dex", 20);
        set("max_qi", 500);
        set("max_jing", 300);
        set("neili", 500);
        set("max_neili", 500);
        set("combat_exp", 2000);
        set("score", 1);

        set_skill("force", 30);
        set_skill("dodge", 30);
        set_skill("unarmed", 30);
        set_skill("parry", 30);
        setup();
        carry_object("/d/gaochang/obj/fake_map");
}

void init()
{
        object ob = this_player();        
        ::init();

        if (interactive(ob))
        {
                remove_call_out("kill_ob");
                call_out("kill_ob", 1, ob); 
        }       
}
