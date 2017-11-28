inherit NPC;
#include <ansi.h>

void create()
{
        set_name("毒郎中", ({ "du langzhong", "du", "langzhong" }));
        set("long", "一个面目凶神恶刹的中年人，现在在到处收集毒药。\n");
        set("gender", "男性");
        set("age", 50);
        set("attitude", "peaceful");
        set("class", "fighter");
        set("str", 35);
        set("int", 28);
        set("con", 30);
        set("dex", 28);
        
        set("max_qi", 600);
        set("max_jing", 600);
        set("neili", 500);
        set("max_neili", 500);
        set("jiali", 20);
        set("combat_exp", 50000);

        set_skill("blade", 60);
        set_skill("ruyi-dao", 60);
        set_skill("force", 60);
        set_skill("dodge", 60);
        set_skill("strike", 60);
        set_skill("claw", 60);
        set_skill("parry", 60);
        set_skill("jinshe-youshenbu", 60);
        set_skill("wudu-xinfa", 60);
        set_skill("tianchan-zhang", 60);
        set_skill("wusheng-zhao", 60);

        map_skill("strike", "tianchan-zhang");
        map_skill("claw", "wusheng-zhao");
        map_skill("dodge", "jinshe-youshenbu");
        map_skill("force", "wudu-xinfa");
        map_skill("blade", "ruyi-dao");

        set("title","五毒教教众");
        setup();
        carry_object(__DIR__"obj/cloth1")->wear();
        carry_object(__DIR__"obj/blade2")->wield();

}

void init()
{
        object ob;
        ::init();

        ob = this_player();

        if (interactive(ob)
           && (string)ob->query("family/family_name") != "五毒教")
        {
                remove_call_out("kill_ob");
                call_out("kill_ob", 1, ob); 
        }
}

