// 岳不群
// modify by rcwiz 2003

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;
inherit F_QUESTER;

#define ZIXIA "/clone/book/zixia_book"

#include <ansi.h>
#include "qizong.h"

int  do_xunshan();
void check_weapon();
void unwield_weapon();

// 重载个人鉴定函数，保证做quest的时候是正义的quest
int is_bad() { return 0; }
int is_good() { return 1; }

void create()
{
        set_name("岳不群", ({ "yue buqun", "yue" }) );
        set("title", "华山派掌门");
        set("nickname", HIC "君子剑" NOR);
        set("gender", "男性");
        set("class", "swordsman");
        set("shen_type", 1);
        set("age", 55);
        set("long", "岳不群自幼执掌华山派，乃当今武林中一等一的高手。\n");
        set("attitude", "peaceful");
        set("str", 26);
        set("con", 30);
        set("dex", 30);
        set("int", 28);

        set("max_qi", 5200);
        set("max_jing", 2600);
        set("neili", 6000);
        set("max_neili", 6000);
        set("jiali", 80);

        set("combat_exp", 2400000);
        set("xunshan", 1);
        set("apprentice_available", 3);

        set("inquiry", ([
                "巡山"           : (: do_xunshan :),
                "夺命连环三仙剑" : "那是气宗的剑术，你问来干什么？\n",
                "剑宗"           : "当年剑气之争，华山死伤无数，哎……往事不提也罢！\n",
        ]));

        set_skill("unarmed", 240);
        set_skill("cuff", 240);
        set_skill("strike", 240);
        set_skill("sword", 260);
        set_skill("blade", 260);
        set_skill("force", 260);
        set_skill("parry", 240);
        set_skill("dodge", 240);
        set_skill("literate", 220);
        set_skill("huashan-jian", 260);
        set_skill("fanliangyi-dao", 260);
        set_skill("huashan-xinfa", 260);
        set_skill("zixia-shengong", 260);
        set_skill("huashan-quan", 240);
        set_skill("poyu-quan", 240);
        set_skill("huashan-zhang", 240);
        set_skill("hunyuan-zhang", 240);
        set_skill("huashan-shenfa", 240);
        set_skill("pixie-jian", 240); 
        set_skill("martial-cognize", 200);

        map_skill("sword", "pixie-jian");
        map_skill("parry", "pixie-jian");
        map_skill("blade", "fanliangyi-dao");
        map_skill("force", "zixia-shengong");
        map_skill("cuff", "poyu-quan");
        map_skill("strike", "hunyuan-zhang");
        map_skill("dodge", "pixie-jian");

        prepare_skill("strike", "hunyuan-zhang");
        prepare_skill("cuff", "poyu-quan");

        set("no_teach", ([
                "pixie-jian"     : "哈哈！那是林家的家传武功，"
                                   "我怎么可能会呢？",
        ]));

        set_temp("apply/attack", 220);
        set_temp("apply/dodge", 220);
        set_temp("apply/parry", 200);
        set_temp("apply/damage", 150);
        set_temp("apply/unarmed_damage", 150);
        set_temp("apply/armor", 200);

        create_family("华山派", 13, "掌门");

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "sword.duo" :),
		(: perform_action, "sword.pi" :),
		(: perform_action, "sword.gui" :),
		(: perform_action, "strike.wuji" :),
		(: perform_action, "cuff.lei" :),
		(: perform_action, "cuff.po" :),
		(: exert_function, "recover" :),
		(: exert_function, "powerup" :),
                (: check_weapon :),
	}));             

        setup();

	set("book_count", 1);
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
        carry_object("/clone/misc/pin");
}

void check_weapon()
{
        if (objectp(query_temp("weapon")))
                return;

        command("wield pin");
        set("chat_msg_combat", ({
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
		(: perform_action, "sword.duo" :),
		(: perform_action, "sword.pi" :),
		(: perform_action, "sword.gui" :),
        }));
        set("chat_chance", 120);
        set("chat_msg", ({
                (: unwield_weapon :),
        }));
}

void unwield_weapon()
{
        command("unwield pin");
        delete("chat_chance");
        delete("chat_msg");
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
		(: perform_action, "sword.cimu" :),
		(: perform_action, "sword.pi" :),
		(: perform_action, "sword.gui" :),
                (: check_weapon :),
        }));
}

void attempt_apprentice(object ob)
{
        if( query("apprentice_available") ) {
                if( find_call_out("do_recruit") != -1 )
                        command("say 慢著，一个一个来。");
                else
                        call_out("do_recruit", 2, ob);
        } else {
                command("say 老夫今天已经收了三个弟子，不想再收徒了。");
        }
}

void do_recruit(object ob)
{
        if( !permit_recruit(ob) )
                return;
        
        if (ob->query("gender") == "女性")
        {
                command("say 我不收女徒弟，你还是去找我师妹吧！");
                return;
        }

        if (ob->query("shen") < 20000)
        {
                command("say 你行侠仗义的事还做得不够，我还不能收你！");
                return;
        }
 
        if (ob->query_skill("huashan-xinfa", 1) < 140)
        {
                command("say 我华山派以修气为主，你连本门心法都还不熟练，我不能收你！");
                return;
        }
      
        if (ob->query_skill("huashan-jian", 1) < 140)
        {
                command("say 你华山剑法还不够熟练，下去多练习练习再来找我吧！");
                return;
        }
        
        command("say 好，好，好，很好。");
        command("say 今日我便收下你了，以后定要多行侠仗义，光大我华山派！");
        command("recruit " + ob->query("id") );        
        
}

int recruit_apprentice(object ob)
{
        if( ::recruit_apprentice(ob) )
        add("apprentice_availavble", -1);
}

void reset()
{
	set("book_count", 1);
        set("apprentice_available", 3);
}

int do_xunshan()
{
        object me = this_player();
      	string date;

    	date = NATURE_D->game_time();
	sscanf(date, "%s日%*s刻", date);

        if (me->query_temp("xunshan"))
        {
               if (!me->query_temp("xunshan/chaoyang"))
               {
                      	message_vision("$N对着$n说：你朝阳峰没去看看？"
                                       "这算巡的什么山？\n", this_object(), me);
                        return 1;
               }
               if (!me->query_temp("xunshan/lianhua"))
               {
                      	message_vision("$N对着$n说：你莲花峰没去看看？"
                                       "这算巡的什么山？\n", this_object(), me);
                      	return 1;
               }
               if (!me->query_temp("xunshan/yuntai"))
               {
                      	message_vision("$N对着$n说：你云台峰没去看看？这算"
                                       "巡的什么山？\n", this_object(), me);
                      	return 1;
               }
               if (!me->query_temp("xunshan/sheshen"))
               {
                      	message_vision("$N对着$n说：你怎么没去舍身崖？这算"
                                       "巡的什么山？\n", this_object(), me);
                      	return 1;
               }
               if (!me->query_temp("xunshan/siguo"))
               {
                      	message_vision("$N对着$n说：你到了思过崖去了？这算"
                                       "巡的什么山？\n", this_object(), me);
                      	return 1;
               }
               if (!me->query_temp("xunshan/yunu"))
               {
                      	message_vision("$N对着$n说：你到玉女峰后面华山小筑"
                                       "去看过了？这算巡的什么山？\n",
                                       this_object(), me);
                      	return 1;
               	}
               	message_vision("$N对着$n说：不错，辛苦了。你这就去"
                               "休息去吧。\n", this_object(), me);
               	me->delete_temp("xunshan");                      
               	me->add("combat_exp", 100 + random(100));
               	return 1;
        }
        else
        {
               if (query("xunshan") == date)
               {
                      	message_vision("$N对着$n说：今天已经有人巡山"
                                     "去了。你明天再来吧。\n", this_object(), me);
                      	return 1;
               }
               if( me->query("family/family_name") != "华山派")
               {
                      	message_vision("$N对着$n大喝一声：本派弟子才能"
                                     "巡山。你是哪来的奸细？\n", this_object(), me);
                      	return 1;
               }
               else
               {
                      	set("xunshan", date);
                      	message_vision("$N对着$n说：本派弟子例当巡山。你，很好，很"
                                       "好！今天就去巡山吧。\n",
				       this_object(), me);
                      	me->set_temp("xunshan/start", 1);
                      	me->set_temp("xunshan/time", time());
                      	return 1;
               }
        }
}

int accept_ask(object me, string topic)
{
        switch (topic)
        {
        case "历练" :
        case "历炼" :
        case "锻炼" :
                return QUEST_D->accept_ask(this_object(), me, topic);
                break;

        case "华岳三神峰" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/fanliangyi-dao/san",
                           "name"    : "华岳三神峰",
                           "sk1"     : "fanliangyi-dao",
                           "lv1"     : 100,
                           "sk2"     : "force",
                           "lv2"     : 140,
                           "neili"   : 2000,
                           "gongxian": 300,
                           "shen"    : 24000, ]));
                break;

        case "混元无极" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/hunyuan-zhang/wuji",
                           "name"    : "混元无极",
                           "sk1"     : "hunyuan-zhang",
                           "lv1"     : 120,
                           "sk2"     : "force",
                           "lv2"     : 120,
                           "gongxian": 400,
                           "neili"   : 1400,
                           "shen"    : 28000, ]));
                break;

        case "封闭手" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/poyu-quan/feng",
                           "name"    : "封闭手",
                           "sk1"     : "poyu-quan",
                           "lv1"     : 60,
                           "force"   : 150,
                           "gongxian": 200,
                           "shen"    : 30000, ]));
                break;

        case "雷动九天" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/poyu-quan/lei",
                           "name"    : "雷动九天",
                           "sk1"     : "poyu-quan",
                           "lv1"     : 120,
                           "gongxian": 400,
                           "shen"    : 40000, ]));
                break;

        case "破石一击" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/poyu-quan/po",
                           "name"    : "破石一击",
                           "sk1"     : "poyu-quan",
                           "lv1"     : 140,
                           "sk2"     : "force",
                           "lv2"     : 120,
                           "gongxian": 600,
                           "shen"    : 60000, ]));
                break;

        case "紫霞秘籍" :
                return MASTER_D->give_item(me, this_object(),
                        ([ "item"    : ZIXIA,
                           "sk1"     : "huashan-xinfa",
                           "lv1"     : 160,
                           "neili"   : 1200,
                           "shen"    : 30000, ]));
                break;

        default:
                return 0;
        }
}

void unconcious()
{
        die();
}
