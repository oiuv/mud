#include <ansi.h>;

inherit NPC;

void create()
{
        set_name("青旗弟子", ({ "qingqi dizi", "qingqi", "dizi" }));
        set("long", "这是日月神教的青旗弟子。\n");
        set("gender", "女性");
        set("attitude", "peaceful");

        set("str", 30);
        set("con", 30);
        set("int", 30);
        set("dex", 30);
        set("neili", 500);
        set("max_neili", 500);
        set("max_jing", 400);
        set("jing", 400);
        set("max_qi", 600);
        set("qi", 600);
        set("jiali", 20);

        set("combat_exp", 20000);
        set("shen_type", -1);
        set("score", 50000);

        set_skill("unarmed", 80);
        set_skill("staff", 80);
        set_skill("force", 80);
        set_skill("parry", 80);
        set_skill("dodge", 80);
        set_skill("literate", 40);

        setup();
        carry_object("/clone/weapon/gangzhang")->wield();        
        carry_object("/clone/cloth/cloth")->wear();
}

void init()
{       
        object ob;

        ::init();

        if (interactive(ob = this_player()) && !is_fighting())
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        if (! ob || environment(ob) != environment()) return;

	say(CYN "青旗弟子高声呼喊道：日月神教，文成武德。千秋万载，一统江湖。\n" NOR);
}

