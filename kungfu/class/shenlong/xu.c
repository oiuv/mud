#include <ansi.h>
inherit NPC;

int ask_gao();

void create()
{
        set_name("许雪亭", ( { "xu xueting", "xu" }) );
        set("title", HIY"神龙教"HIG"青龙使"NOR);
        set("nickname", HIR "热血神龙" NOR);
        set("gender", "男性" );
        set("age", 55);
        set("long", "这是个五十来岁的高瘦汉子，着一袭青衣，昂然挺立。\n");
        
        set("str", 25);
        set("int", 32);
        set("con", 24);
        set("dex", 22);
        
        set("qi", 3900);
        set("max_qi", 3900);
        set("jing", 1900);
        set("max_jing", 1900);
        set("neili", 4400);
        set("max_neili", 4400);
        set("jiali", 100);
        set("combat_exp", 850000);
        set("shen_type", -1);
        
        set_skill("force", 180);
        set_skill("dodge", 170);
        set_skill("unarmed", 180);
        set_skill("parry", 180);
        set_skill("sword", 180);
        set_skill("taoism", 160);
        set_skill("literate", 60);
        set_skill("tiyunzong", 170);
        set_skill("taiji-quan", 180);
        set_skill("taiji-shengong", 180);
        set_skill("taiji-jian", 180);
        set_skill("shedao-qigong", 180);
        set_skill("shenlong-xinfa", 180);
        
        map_skill("force", "taiji-shengong");
        map_skill("dodge", "tiyunzong");
        map_skill("unarmed", "taiji-quan");
        map_skill("parry", "taiji-jian");
        map_skill("sword", "taiji-jian");
        
	create_family("神龙教", 0, "长老");

        set("inquiry", ([
                "百花腹蛇膏" : (: ask_gao :),
                "神龙教" : "一般人是入不了我神龙教的(join shenlongjiao).\n",
                "洪安通" : "教主脾气不好,要讨他欢心才好。\n",
                "教主"   : "教主脾气不好,要讨他欢心才好。\n",
                "入教"   : "一般人是入不了我神龙教的(join shenlongjiao).\n",
                "口号"   : "万年不老！永享仙福！寿与天齐！文武仁圣！\n",
        ]));
        
        set("chat_chance", 1);
        set("chat_msg", ({
                "许雪亭忽然一拍脑袋，说：对了，可以用百花腹蛇膏！\n",
                "许雪亭怒道：唉，偌大一个神龙教，都毁在一个娘们手里了！\n",
                "许雪亭叹口气，说道：唉，不杀了洪安通，谁也活不了。\n",
        }) );
        setup();
        carry_object("/d/city/obj/duanjian")->wield();
}

int ask_gao()
{
	say(
	"\n许雪亭悄声对你说：这可是本教禁物啊。它一遇鲜血，便生浓香，\n"
	"我们住在这灵蛇岛上，人人都服惯了雄黄酒，以避毒蛇，这股香气\n"
	"一碰到雄黄酒，便使人筋骨酥软，不能动弹。对了，你怎么也知道？\n"
		);
	return 1;
}

int accept_object(object who, object ob)
{
	object obn;

	if( !who || environment(who) != environment() ) return 0;
	if ( !objectp(ob) ) return 0;
	if ( !present(ob, who) ) return notify_fail("你没有这件东西。\n");

        if (is_busy())
        {
                command("say 慢慢来，急什么！");
                return 0;
        }

	if (  (string)ob->query("id") != "fushe dan"
		&& (string)ob->query("id") != "baixiang hua" )
		    return notify_fail("许雪亭摇头道：如果杀不了洪安通，给我什么也没用啊。。。\n");

	if ( (string)ob->query("id") == "fushe dan" )
		{
		  if(query_temp("baixianghua"))
		  {
                  message_vision("\n许雪亭见是腹蛇胆，大喜道：腹蛇胆百香花都有了，百花腹蛇膏练成了！\n",who);
                  obn=new("/d/shenlong/obj/baihua");
                  obn->move(who);
                  delete_temp("fushedan");
                  delete_temp("baixianghua");
                  destruct(ob);
                  return 1;
		  }
		  else	
		  {
		  if(query_temp("fushedan"))
                  {
    	                   message_vision("\n许雪亭见是腹蛇胆，对$N摇头道：腹蛇胆我有了，就差百香花了。\n",who);
			   return 0;
		  }
		  else	  
                  {
		  message("vision","许雪亭看见腹蛇胆，大喜道：有了腹蛇胆，只差百香花了。\n",environment(who));
		  set_temp("fushedan",1);
                  destruct(ob);
	          return 1;
		  }
		}
	}
	if ( (string)ob->query("id") == "baixiang hua")
		{
		  if(query_temp("fushedan"))
		  {
                  message_vision("\n许雪亭见是百香花，大喜道：腹蛇胆百香花都有了，百花腹蛇膏练成了！\n",who);
                  obn=new("/d/shenlong/obj/baihua");
                  obn->move(who);
                  delete_temp("fushedan");
                  delete_temp("baixianghua");
                  destruct(ob);
                  return 1;		 
		  } 		
		  else	
		  {	
		  if(query_temp("baixianghua"))
                  {
        		   message_vision("\n许雪亭见是百香花，对$N摇头道：百香花我有了，就差腹蛇胆了。\n",who);
			   return 0;
		  }
		  else	  
                  {
		  message("vision","许雪亭看见百香花，大喜道：有了百香花，只差腹蛇胆了。\n",environment(who));
		  set_temp("baixianghua",1);
                  destruct(ob);
	          return 1;
		  }
		 }	
	}
}

void attempt_apprentice(object ob)
{
        command("say 我不收徒，你找教主去吧！ ");
        return;
}

