inherit NPC;

void create()
{
        set_name("掌澡僧人",({"seng ren"}));
        set("long", "管理澡堂的僧人。\n" );
        set("gender", "男性");
        set("attitude", "peace");

        set("age", 34);
        set("str", 15);
        set("int", 16);
        set("con", 20);
        set("attitude", "peaceful");
        
        set_skill("unarmed", 40);
        set_skill("dodge", 40);
        set_temp("apply/attack", 20);
        set_temp("apply/defense", 20);

        setup();
        carry_object("/clone/misc/cloth")->wear();
}
