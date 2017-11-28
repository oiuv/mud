#include <ansi.h> 

inherit NPC;

void create()
{
        set_name("迎宾小姐", ({ "yinbing xiaojie", "xiaojie", "yinbing" }) );
        set("long", "这是一位美丽的迎宾小姐，她正对着你甜甜的笑呢。\n");
        set("title", HIM "【武林外传】" NOR); 
        set("gender", "女性");
 
        set("age", 21);
        set("per", 30);
        setup();
        carry_object("/d/city/npc/obj/qunzi")->wear();
}

void init()
{       
        object ob; 
//      mapping myfam; 

        ob = this_player();

        ::init();
        if( interactive(ob) && !is_fighting() ) {
                        remove_call_out("greeting");
                        call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        if( !ob || environment(ob) != environment() ) return;
        switch( random(2) ) {
                case 0:
                        say( "迎宾小姐笑咪咪地说道：这位" + RANK_D->query_respect(ob)
                                + "，欢迎光临。\n");
                        break;
                case 1:
                        say( "迎宾小姐甜甜的说道：这位" + RANK_D->query_respect(ob)
                                + "，请进请进。\n");
                        break;
        }
}