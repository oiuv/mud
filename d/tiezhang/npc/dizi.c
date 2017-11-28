// dizi2.c

#include <ansi.h>

inherit NPC;
void create()
{
          set_name("厚土旗弟子", ({"dizi"}));
       set("long",
                "他是身材矮小，两臂粗壮，膀阔腰圆。他手持兵\n"
                "刃，身穿一黑色圣衣，似乎有一身武艺。\n"
        );

        set("gender", "男性");
        set("attitude", "peaceful");
        
        set("age", 35);
        set("shen_type", 0);
        set("str", 25);
        set("int", 20);
        set("con", 20);
        set("dex", 25);
        set("max_qi", 500);
        set("max_jing", 300);
        set("neili", 500);
        set("max_neili", 500);
        set("jiaji", 50);
        set("combat_exp", 10000);
        set("score", 1);

        set_skill("force", 50);
//        set_skill("shenhuo-shengong", 50);
        set_skill("dodge", 50);
        set_skill("tiyunzong", 50);
        set_skill("cuff", 50);
//        set_skill("banruo-zhang", 50);待加
        set_skill("parry", 50);
        set_skill("blade", 50);
        
        map_skill("force", "shenhuo-shengong");
        map_skill("dodge", "tiyunzong");
        map_skill("parry", "cibei-dao");
        map_skill("blade", "cibei-dao");
        setup();

	carry_object(__DIR__"obj/black-cloth")->wear();
}

void init()
{
        object me, ob;
        mapping fam;

        ::init();

        ob = this_player();
        me = this_object();
        
        if (interactive(ob) 
        && !environment(ob)->query("no_fight")
        && !present("tieyan ling", ob) 
        && ( (fam = ob->query("family")) && fam["family_name"] != "明教" ) )
        {
                if( !ob->query_temp("warned") ) {
                        command("say 你是谁？  怎么闯到光明顶里来了？！");
                        command("say 快给我速速离开，下次看到决不轻饶！");
                        ob->set_temp("warned", 1);
                }
                  else if( ob->query_temp("stay") < 3 ) ob->add_temp("stay", 1);
                else {
                	command("say 大胆狂徒，竟敢闯到明教来撒野！！！\n");
			remove_call_out("hiting_ob");
                     	call_out("hiting_ob", 1, ob);
		}
        }       
}
int hiting_ob(object ob)
{
	object me;
	me=this_object();
	me->set_leader(ob);
	ob->kill_ob(me);
        me->fight_ob(ob);
	remove_call_out("moving_ob");
	call_out("moving_ob",1,ob);
}
int moving_ob(object ob)
{
	ob = this_player();
	if (!living(ob)){
        switch( random(3) ) {
	case 0:
	     	command("say 哼，看你以后还敢不敢乱闯光明顶！！！");
	break;
	case 1:
		command("say 交给冷大人处理吧，关他一年半月的。");
	break;
	case 2:
		command("nod");
	break;
	}
	ob->move("/u/qingyun/mingjiao/jianyu");            
	}
	else {
	remove_call_out("hiting_ob");
	call_out("hiting_ob",1,ob);
	}
}
