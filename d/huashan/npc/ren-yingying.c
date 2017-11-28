// ren-yingying.c

inherit NPC;

void create()
{
        set_name("任盈盈", ({ "ren yingying", "yingying" }) );
        set("title","魔教圣姑");
        set("gender", "女性" );
        set("age", 19);
        set("str", 16);
        set("con", 30);
        set("int", 30);
        set("dex", 30);

        set("attitude", "friendly");

        set("qi",2500);
        set("max_qi",2500);
        set("jing",1200);
        set("max_jing",1200);
        set("neili", 2800);
        set("max_neili", 2800);
        set("jiali", 30);

        set("long",     "任盈盈是魔教教主任我行的独生女儿。\n");
        set("combat_exp", 250000);
        set("shen_tpye", 1);
        set_skill("unarmed", 90);
        set_skill("sword", 90);
        set_skill("force", 100);
        set_skill("parry", 100);
        set_skill("dodge", 100);
        set_skill("literate", 100);

        set_skill("huashan-jian", 100);
        set_skill("huashan-xinfa", 100);
        set_skill("huashan-quanfa", 100);
        set_skill("feiyan-huixiang", 100);

        map_skill("sword", "huashan-jian");
        map_skill("parry", "huashan-jian");
        map_skill("force", "huashan-xinfa");
        map_skill("unarmed", "huashan-quanfa");
        map_skill("dodge", "feiyan-huixiang");
        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();

}

int accept_fight(object me)
{
        command("say 小女子怎会是你的对手?");
        return 0;
}
void init()
{
        object ob;

        ::init();
        if( interactive(ob = this_player()) && !is_fighting() ) {
                remove_call_out("greeting");
                call_out("greeting",2 , ob);
        }
}
void greeting(object ob)
{
      say( "任盈盈微微叹了口气：“不知道我的令狐大哥在何方?”\n");
      if ( ((int)ob->query_dex()>=25) && ((int)ob->query_int()>=25) )
      {
           tell_object(ob,"任盈盈说道：请你务必找到我令狐大哥.\n");
           ob->set("marks/feng-qingyang",1);
      }
      tell_object(ob,"任盈盈所完这句话，飘然隐去.\n");
      call_out("goway",10);
}
void goway(){
      destruct(this_object());
}
