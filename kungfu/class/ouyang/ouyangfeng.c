// ouyangfeng.c

#include <ansi.h>
#include "ouyang.h"

#define LINGSHE_ZHANG    "/d/baituo/obj/lingshezhang"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;
inherit F_QUESTER;


mixed ask_music_book();
mixed ask_zhang();
mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();

void create()
{
	set_name("欧阳锋", ({ "ouyang feng", "ouyang", "feng" }));
	set("long", "他就是白驼山庄主，号称“西毒”的欧阳锋。脸型瘦削，\n"
		    "身形剽悍，虽然受到郭靖欺骗误学习了「九阴真经」而走\n"
                    "火入魔，一度变得精神错乱，但是现在已然恢复，功力犹\n"
                    "胜往昔。\n");
	set("title", "白驼山庄主");
	set("gender", "男性");
	set("age", 53);
	set("nickname", HIR "西毒" NOR);
	set("shen_type",-1);
	set("attitude", "peaceful");

	set("str", 32);
	set("int", 34);
	set("con", 34);
	set("dex", 32);

	set("qi", 6000);
	set("max_qi", 6000);
	set("jing", 3000);
	set("max_jing", 3000);
	set("neili", 7300);
	set("max_neili", 7300);
	set("jiali", 120);

	set("combat_exp", 2500000);

	set_skill("force", 350);
	set_skill("unarmed", 350);
	set_skill("dodge", 350);
	set_skill("parry", 350);
	set_skill("cuff", 350);
  set_skill("finger", 350);
	set_skill("staff", 350);
	set_skill("training", 400);
  set_skill("poison", 400);
  set_skill("shedu-qiqiao", 350);
	set_skill("hamagong", 350);
	set_skill("baituo-xinfa", 350);
	set_skill("chanchu-bufa", 350);
	set_skill("lingshe-quan", 350);
	set_skill("lingshe-zhangfa", 350);
	set_skill("baibian-daxue", 350);
  set_skill("guzheng-jifa", 400);
  set_skill("xiyu-tiezheng", 400);
  set_skill("wushe-qu", 400);
  set_skill("literate", 300);
	set_skill("medical", 350);
	set_skill("baituo-michuan", 350);

	map_skill("force", "hamagong");
	map_skill("dodge", "chanchu-bufa");
	map_skill("cuff",  "lingshe-quan");
	map_skill("parry", "lingshe-zhangfa");
	map_skill("staff", "lingshe-zhangfa");
        map_skill("finger", "shedu-qiqiao");
        map_skill("poison", "shedu-qiqiao");
        map_skill("guzheng-jifa", "xiyu-tiezheng");

        prepare_skill("finger", "shedu-qiqiao");
        prepare_skill("cuff", "lingshe-quan");

	create_family("欧阳世家", 5, "掌门");
        set("chat_chance", 2);
        set("chat_msg",({
                "欧阳锋自言自语道：何日我欧阳氏才能重霸江湖呢…\n",
                "欧阳锋道：我儿欧阳克必能够重振我家雄风！\n",
                "欧阳锋道：江湖险恶，困难重重哪！\n",
        }));

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "staff.chan" :),
		(: perform_action, "staff.qianshe" :),
		(: perform_action, "staff.wuji" :),
		(: perform_action, "cuff.rou" :),
		(: exert_function, "powerup" :),
		(: exert_function, "recover" :),
	}));

        set("inquiry", ([              
		            "筝谱"   : (: ask_music_book :),
		            "古筝技法": (: ask_music_book :),
		            "灵蛇杖" : (: ask_zhang :),
		            "横行无忌": (: ask_skill1 :),
		            "千蛇出洞": (: ask_skill2 :),
                "千蛇万噬": (: ask_skill3 :),
        ]));

        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

	set("music_book", 1);

	setup();
	carry_object("/d/baituo/obj/shezhang")->wield();
	carry_object("/clone/misc/cloth")->wear();
        carry_object("d/baituo/obj/tiezheng");
	add_money("silver", 50);
}

int recognize_apprentice(object me, string skill)
{
        if (skill != "guzheng-jifa")
                return 0;

        if (me->query_temp("can_learn/ouyang/guzheng-jifa"))
                return 1;

        command("say 好吧，你愿意学我就传你一点古筝之道。");
        me->set_temp("can_learn/ouyang/guzheng-jifa", 1);
        return 1;
}

void attempt_apprentice(object ob)
{
        if(! permit_recruit(ob))
                return;

        if((int)ob->query("combat_exp") < 200000)
        {
                if (random(2))
                        command("smile");
                else
                        command("pat " + ob->query("id"));

                command("say 你的经验还不够，先和我的侄儿欧阳克学习武功吧。");
	        return ;
        }

        command("sigh");
        command("pat " + ob->query("id"));
        command("recruit " + ob->query("id"));
        message_vision("欧阳锋喃喃自语道：我欧阳家真是后继有人啊！\n",
                       this_object());
        return;
}

mixed ask_skill1()
{
        object me; 
        me = this_player(); 

        if (me->query("can_perform/lingshe-zhangfa/wuji")) 
                return "你还不快去练功去？好好把我们欧阳家发扬光大！"; 

        if (me->query("family/family_name") != query("family/family_name"))   
                return ("哪来的野小子敢在这里撒野！\n");
                
        if (me->query("gongxian") < 500)
                return "你为我欧阳家效力还不够，这招我先不忙传你。";

        if (me->query_skill("lingshe-zhangfa", 1) < 100) 
                return ("你的杖法还不到家，学不了「横行无忌」！\n"); 

        command("say 好吧，你看好了。");  
        tell_object(me, HIR"欧阳峰将「横行无忌」演练了一遍，你心里默默暗记，心中惊叹不已。\n"NOR);  
        if (me->can_improve_skill("staff")) 
                me->improve_skill("staff", 1500000); 
        if (me->can_improve_skill("staff")) 
                me->improve_skill("staff", 1500000); 
        if (me->can_improve_skill("lingshe-zhangfa")) 
                me->improve_skill("lingshe-zhangfa", 1500000); 
        if (me->can_improve_skill("lingshe-zhangfa")) 
                me->improve_skill("lingshe-zhangfa", 1500000); 
        me->improve_skill("martial-cognize", 1500000); 
        me->set("can_perform/lingshe-zhangfa/wuji", 1);
        me->add("gongxian",-500);
        return 1;   
}

mixed ask_skill2()
{
        object me;

        me = this_player();
        if (me->query("can_perform/lingshe-zhangfa/qianshe"))
                return "你还不快去练功去？好好把我们欧阳家发扬光大！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪儿来的？找死么？";

        if (me->query("shen") > -40000)
                return "你这人手段不够狠毒，我现在还不能传你绝招！";
                
                if (me->query("gongxian") < 800)
                return "你为我欧阳家效力还不够，这招我先不忙传你。";

        if (me->query_skill("lingshe-zhangfa", 1) < 120)
                return "你先好好把灵蛇杖法练好了再说！";

        message_vision(HIY "$n" HIY "喝道：看仔细了！说把荡"
                       "臂横扫，伸伸缩缩，当真是变幻无穷！把$N"
                       HIY "的眼睛都看直了。\n" NOR,
                       me, this_object());
        command("heihei");
        command("say 我演示的这么清楚，你看懂了没有？");
        tell_object(me, HIG "你学会了千蛇出洞。\n" NOR);
        if (me->can_improve_skill("staff")) 
                me->improve_skill("staff", 1500000); 
        if (me->can_improve_skill("staff")) 
                me->improve_skill("staff", 1500000); 
        if (me->can_improve_skill("lingshe-zhangfa")) 
                me->improve_skill("lingshe-zhangfa", 1500000); 
        if (me->can_improve_skill("lingshe-zhangfa")) 
                me->improve_skill("lingshe-zhangfa", 1500000); 
        me->improve_skill("martial-cognize", 1500000); 
        me->set("can_perform/lingshe-zhangfa/qianshe", 1);
        me->add("gongxian",-800);
        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();
        if (me->query("can_perform/lingshe-zhangfa/wanshi"))
                return "自己好好多练习吧！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们欧阳世家的人，何出此言？";

        if (me->query("shen") > -120000)
                return "你行事还不够狠毒，学不会这招「千蛇万噬」！";
                
                if (me->query("gongxian") < 1000)
                return "你为我欧阳家效力还不够，这招我先不忙传你。";

        if (me->query_skill("lingshe-zhangfa", 1) < 180)
                return "你的灵蛇杖法还不到家，要多练练！";

        message_vision(HIY "$n" HIY "微微颔首，随手拣起一根木条点向$N"
                       HIY "$N" HIY "见来招缓慢，只是随手向上一格。\n"
                       "忽然$p" HIY "杖势一变，木条从意想不到的角度拐"
                       "来，$P" HIY "大吃一惊，慌乱不迭。\n" NOR,
                       me, this_object());
        command("smile");
        command("say 你可明白了？");
        tell_object(me, HIG "你学会了千蛇万噬。\n" NOR);
        if (me->can_improve_skill("staff")) 
                me->improve_skill("staff", 1500000); 
        if (me->can_improve_skill("staff")) 
                me->improve_skill("staff", 1500000); 
        if (me->can_improve_skill("lingshe-zhangfa")) 
                me->improve_skill("lingshe-zhangfa", 1500000); 
        if (me->can_improve_skill("lingshe-zhangfa")) 
                me->improve_skill("lingshe-zhangfa", 1500000); 
        me->improve_skill("martial-cognize", 1500000); 
        me->set("can_perform/lingshe-zhangfa/wanshi", 1);
        me->add("gongxian",1000);
        return 1;
}

mixed ask_music_book()
{
        object me;
        object ob;

        me = this_player();
        if (query("music_book") < 1)
                return "我的筝谱已经借出去了。\n";

        ob = new("/clone/book/zhengpu");
        ob->move(me, 1);
        message_vision("$n把筝谱给了$N，道：你拿去自己好好琢磨吧。\n",
                       me, this_object());
        set("music_book", 0);
        return 1;
}

mixed ask_zhang()
{
        object me;
        object ob;
        object owner;

        me = this_player();
        if (me->is_good())
        {
                if (me->query("family/family_name") == "欧阳世家")
                        message_vision("$N大怒，对$n道：“你身为世家弟子，"
                                       "反而去学什么侠义，还不快快醒转？”\n",
                                       this_object(), me);
                else
                        message_vision("$N大怒，对$n喝道：“好一个臭小子，"
                                       "居然敢窥测灵蛇杖？”\n",
                                       this_object(), me);
                return 1;
        }

        if (me->query("family/family_name") != "欧阳世家")
                return "灵蛇杖是我们欧阳家的宝物，你打听它干什么？";

        if (me->query("family/master_id") != query("id"))
                return "只有我的弟子才能用灵蛇杖，你还是请回吧。";

        if (me->query("shen") > -60000)
                return "你还不够心狠手辣，我不能把灵蛇杖交给你。";

        ob = find_object(LINGSHE_ZHANG);
        if (! ob) ob = load_object(LINGSHE_ZHANG);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "灵蛇杖不是在你的手中么，怎么反而来找我呢？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "我已经把灵蛇杖借出去了。";

                if (owner->query("family/master_id") == query("id"))
                        return "灵蛇杖现在在" + owner->query("name") +
                               "手中，你要想用就去找他吧。";
                else
                        return "灵蛇杖现在落在" + owner->query("name") +
                               "手中，你去把它找回来吧。";
        }

        ob->move(this_object());
        message_vision("$N点点头道：“好，你便用这灵蛇杖去对付那些正派"
                       "人士吧！”\n", this_object(), me);
        command("give lingshe zhang to " + me->query("id"));
        //ob->start_borrowing();
        return 1;
}

void reset()
{
        set("music_book", 1);
}

void unconcious()
{
        die();
}
