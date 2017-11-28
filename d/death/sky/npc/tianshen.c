#include <ansi.h>
inherit NPC;

void create()
{
        set_name("天神", ({ "tian shen", "tian", "shen" }) );
        set("gender", "男性" );
        set("age", 2100);
        set("long", HIC "他就是跟随泥潭世界大boss——高处不胜寒的仆人，如今成了天神。\n" NOR);
        set("attitude", "friendly");
        set("max_jing", 25000);
        set("max_qi", 25000);
        set("max_jingli", 50000);
        set("jingli", 50000);
        set("max_neili", 50000);
        set("neili", 50000);
        set("jiali", 375);
        set("str", 50);
        set("int", 50);
        set("con", 50);
        set("dex", 50);
        set("combat_exp", 60000000);
        //set("level", 100);
                
        set_skill("unarmed", 800);
        set_skill("sword", 800);
        set_skill("blade", 800);
        set_skill("staff", 800);
        set_skill("hammer", 800);
        set_skill("club", 800);
        set_skill("whip", 800);
        set_skill("dagger", 800);
        set_skill("throwing", 800);
        set_skill("parry", 800);
        set_skill("dodge", 800);
        set_skill("force", 800);
        set_skill("never-defeated", 800);
        set_skill("martial-cognize", 800);

        map_skill("sword", "never-defeated");
        map_skill("blade", "never-defeated");
        map_skill("staff", "never-defeated");
        map_skill("hammer", "never-defeated");
        map_skill("club", "never-defeated");
        map_skill("whip", "never-defeated");
        map_skill("dagger", "never-defeated");
        map_skill("parry", "never-defeated");
        map_skill("dodge", "never-defeated");
        map_skill("force", "never-defeated");

        set("chat_chance_combat", 200);
        set("chat_msg_combat", ({
                (: perform_action, "sword.po" :),
                (: exert_function, "sword.juemie" :),
                (: exert_function, "sword.lei" :),
                (: exert_function, "sword.tianhua" :),
                (: exert_function, "sword.wanli" :),
                (: exert_function, "sword.yuce" :),
        }) );
        
        setup();

        set_temp("apply/damage", 200); 
        set_temp("apply/unarmed_damage", 200); 
        set_temp("apply/armor", 400); 
                
        carry_object("/clone/cloth/cloth")->wear();
        carry_object("/clone/weapon/changjian")->wield();
        
        create_family("人神魔三界", 2, "天界总管");
        set("title", HIW "天界总管" NOR);        
}

