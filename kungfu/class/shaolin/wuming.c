#include <ansi.h> 

inherit NPC;
inherit F_MASTER; 
inherit F_COAGENT;

mixed ask_skill1(); 

void create()
{
        set_name("无名老僧", ({ "wuming laoseng", "wuming" }));
        set("long",
                "他是一位须发花白的老僧，身着粗布衣衫，是"
                "少林寺里面打杂的僧人。\n"
        );

        set("gender", "男性");
        set("attitude", "friendly");
        set("class", "bonze");

        set("age", 98);
        set("shen_type", 1);
        set("str", 37);
        set("int", 42);
        set("con", 41);
        set("dex", 36);
        set("max_qi", 7000);
        set("max_jing", 3500);
        set("neili", 8000);
        set("max_neili", 8000);
        set("jiali", 85);
        set("combat_exp", 3000000);

        set_skill("buddhism", 450);
        set_skill("literate", 300);

        set_skill("blade", 300);
        set_skill("claw", 300);
        set_skill("club", 300);
    set_skill("unarmed", 300);
    set_skill("jiasha-fumogong", 300);
        set_skill("cuff", 300);
        set_skill("dodge", 300);
        set_skill("finger", 300);
        set_skill("force", 350);
        set_skill("hand", 300);

        set_skill("parry", 300);
        set_skill("staff", 300);
        set_skill("strike", 300);
        set_skill("sword", 300);
        set_skill("whip", 300);

        set_skill("banruo-zhang", 300);
        set_skill("cibei-dao", 300);
        set_skill("damo-jian", 300);
        set_skill("luohan-fumogong", 300);
        set_skill("fengyun-shou", 300);
        set_skill("fumo-jian", 300);
        set_skill("hunyuan-yiqi", 300);
        set_skill("ruying-suixingtui", 300);

        set_skill("shaolin-xinfa", 300);
        set_skill("jingang-quan", 300);
        set_skill("longzhua-gong", 300);
        set_skill("luohan-quan", 300);
        set_skill("nianhua-zhi", 300);
        set_skill("pudu-zhang", 300);
        set_skill("qianye-shou", 300);
        set_skill("rulai-zhang", 300);
        set_skill("sanhua-zhang", 300);
        set_skill("riyue-bian", 300);
        set_skill("shaolin-shenfa", 300);
        set_skill("weituo-gun", 300);
        set_skill("wuchang-zhang", 300);
        set_skill("xiuluo-dao", 300);
        set_skill("yingzhua-gong", 300);
        set_skill("yijinjing", 350);
        set_skill("yizhi-chan", 300);
        set_skill("zui-gun", 300);
        set_skill("jingang-buhuaiti", 300);

        map_skill("blade","cibei-dao");
        map_skill("claw", "longzhua-gong");
        map_skill("club", "wuchang-zhang");
        map_skill("cuff", "luohan-quan");
        map_skill("dodge", "shaolin-shenfa");
        map_skill("finger", "nianhua-zhi");
        map_skill("force", "yijinjing");
        map_skill("hand", "fengyun-shou");
        map_skill("parry", "jingang-buhuaiti");
        map_skill("staff", "weituo-gun");
        map_skill("strike", "rulai-zhang");
        map_skill("sword", "fumo-jian");
        map_skill("whip", "riyue-bian");

            prepare_skill("strike", "rulai-zhang"); 

        set("inquiry", ([ 

                "万佛朝宗" : (: ask_skill1 :), 
        ])); 

        create_family("少林派", 0, "打杂僧人");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
        (: perform_action, "strike.zong" :),
                (: perform_action, "finger.fuxue" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/attack", 300);
        set_temp("apply/defense", 300);
        set_temp("apply/unarmed_damage", 150);
        set_temp("apply/armor", 300);

        setup();

        carry_object("/d/shaolin/obj/cheng-cloth")->wear();

}

void attempt_apprentice(object ob)
{
              if (ob->query("family/family_name") == query("family/family_name"))
              {
                      command("say 我早就不收徒弟了，不过你也是我们"
                              "少林的弟子，就传你一些老僧的粗浅功夫吧！"
                              "我就教你如影随行腿(ruying-suixingtui)和千手如来掌(rulai-zhang)吧！");
              } else 
                      command("say 我只是少林的一名扫地僧，哪里懂什么武功。");
}


int recognize_apprentice(object ob, string skill) 
{
        if (ob->query("family/family_name") != "少林派") 
        {
                command("hmm"); 
                command("say 老衲与阁下素无渊源，何谈传授二字？\n"); 
                return -1; 
        }


        if ((int)ob->query("shen") < 50000) 
        {
                command("hmm"); 
                command("say 我少林派素以普渡众生为根本，你似乎做的还不够。"); 
                return -1; 
        } 

        if (skill != "strike" && skill != "rulai-zhang" && 
        skill != "unarmed" && skill != "ruying-suixingtui") 
        {
                command("shake"); 
                command("say 我只传授你一些拳脚和掌法的功夫，其它还是找你师父学吧。"); 
                return -1; 
        }

        if (skill == "strike" && ob->query_skill("strike", 1) > 179) 
        {
                command("say 你的掌法造诣已经非同凡响了，剩下就自己去练吧。"); 
                return -1; 
        }

        if (skill == "unarmed" && ob->query_skill("unarmed", 1) > 179) 
        {
                command("say 你的拳脚功夫已经非同凡响了，剩下就自己去练吧。"); 
                return -1; 
        }

        if (! ob->query_temp("can_learn/wuming")) 
        { 
                command("say 阁下既然已经拜达摩祖师，想必已是得道高僧。"); 
                command("say 这如影随行腿、千手如来掌乃是正大恢弘的武功，就传给你好了。"); 
                command("say 我这儿还有一套袈裟功的绝招，不知道你能学会吗？"); 
                ob->set_temp("can_learn/wuming", 1); 
        } 
        return 1; 
}

mixed ask_skill1() 
{
        object me; 

        me = this_player(); 
        if (me->query("can_perform/rulai-zhang/zong")) 
                return "你已经学会了此招，还和老衲开这种玩笑。"; 

        if (me->query("family/family_name") != "少林派" ) 
                return "老衲与阁下素无渊源，不知阁下这话从何而来？"; 

        if (me->query_skill("rulai-zhang", 1) < 1) 
                return "你连千手如来掌都没学，还谈什么绝招可言？"; 

        if (me->query("gongxian") < 800) 
                return "嗯，你在少林派没什么作为，这招我不传你。"; 

        if (me->query("shen") < 150000) 
                return "你侠义正事做得不够，这招我不能传你。"; 

        if (me->query_skill("force") < 350) 
                return "你的内功火候不足，用不了这一招！"; 

        if (me->query_skill("rulai-zhang", 1) < 220) 
                return "你千手如来掌尚未修炼得精深，难以运用此招。"; 

        message_vision(HIY "$n" HIY "对$N" HIY "笑了笑，随即双掌伸出" 
                       "但见一掌浑厚有\n力，掌到中途，突然变招" 
                       "，一掌化为两掌，两掌化为\n四掌，继而变为" 
                       "八掌，八掌化十二掌，铺天盖地无穷\n无尽。" 
                       "只看的$N" HIY "目瞪口呆。\n" NOR, 
                       me, this_object()); 
        command("nod"); 
        command("say 你可看明白了？"); 
        tell_object(me, HIC "你学会了「万佛朝宗」。\n" NOR); 

        if (me->can_improve_skill("strike")) 
                me->improve_skill("strike", 1500000); 
        if (me->can_improve_skill("rulai-zhang")) 
                me->improve_skill("rulai-zhang", 1500000); 
        me->improve_skill("martial-cognize", 1500000); 
        me->set("can_perform/rulai-zhang/zong", 1); 
        me->add("gongxian", -800); 
        return 1; 
}

int accept_ask(object me, string topic)  
{
        switch (topic)  
        {
        case "如影随形" :  
                return MASTER_D->teach_pfm(me, this_object(),  
                        ([ "perform" : "can_perform/ruying-suixingtui/ruying",  
                           "name"    : "如影随形",  
                           "sk1"     : "ruying-suixingtui",  
                           "lv1"     : 160,  
                           "force"   : 250,  
                           "neili"   : 2000,  
                           "gongxian": 800,  
                           "shen"    : 30000, ]));  
                break;
                
        case "避云遮日" :  
                return MASTER_D->teach_pfm(me, this_object(),  
                        ([ "perform" : "can_perform/jiasha-fumogong/zhe",  
                           "name"    : "避云遮日",  
                           "sk1"     : "jiasha-fumogong",  
                           "lv1"     : 180,  
                           "force"   : 300,  
                           "neili"   : 3500,  
                           "gongxian": 1000,  
                           "shen"    : 70000, ]));  
                break;  

        default:  
                return 0;  
        }
}

