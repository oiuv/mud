// lady3.c
inherit NPC;

void create()
{
        set_name("丫环", ({ "ya huan","ya","huan" }) );
        set("gender", "女性" );
        set("age", 16);
        set("long", "这是一个容貌清秀的天真无邪的丫环，正在打闹的开心。\n");
        set("shen_type", 1);
        set("combat_exp", 1000);
        set("str", 20);
        set("dex", 18);
        set("con", 19);
        set("int", 20);
        set("attitude", "friendly");
        set("max_qi", 100);
        set("max_jing", 100);
        set("neili", 100);
        set("max_neili", 100);
        set("score", 800);

        set_skill("force", 20);
        set_skill("dodge", 20);
        set_skill("unarmed", 20);
        set_skill("parry", 20);
        set_temp("apply/attack", 8);
        set_temp("apply/defense", 12);
        set_temp("apply/damage", 11);
        set_temp("apply/armor", 7);
        setup();
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        object ob;

        ::init();

        if( interactive(ob = this_player()) && !is_fighting() ) {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}
void greeting(object ob)
{
        if( !ob || environment(ob) != environment() ) return;
             say("丫环笑着说道：这位" + RANK_D->query_respect(ob)
             + "，欢迎光临狮子林。\n");
        return;
}
