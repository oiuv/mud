// Npc: /kungfu/class/shaolin/xuan-ci.c
// Date: YZC 96/01/19

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;

#define IS_XUAN_CI      1

#include "xuan.h"

string ask_me();
void create()
{
        set_name("玄慈大师", ({
                "xuanci dashi",
                "xuanci",
                "dashi",
        }));
        set("long",
                "他是一位白须白眉的老僧，身穿一袭金丝绣红袈裟。\n"
                "他身材略显佝偻，但却满面红光，目蕴慈笑，显得神完气足。\n"
        );

        set("nickname", "少林寺方丈");
        set("gender", "男性");
        set("attitude", "friendly");
        set("class", "bonze");

        set("age", 70);
        set("shen_type", 1);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        set("max_qi", 2800);
        set("max_jing", 1400);
        set("neili", 3800);
        set("max_neili", 3800);
        set("jiali", 50);
        set("combat_exp", 1450000);
        set("score", 500000);

        set_skill("force", 180);
        set_skill("hunyuan-yiqi", 180);
        set_skill("dodge", 180);
        set_skill("shaolin-shenfa", 180);
        set_skill("finger", 180);
        set_skill("jingang-zhi", 180);
        
        //为配合金刚指新增经络学 by 薪有所属
        set_skill("jingluo-xue", 200);

        set_skill("strike", 180);
        set_skill("hand", 180);
        set_skill("claw", 180);
        set_skill("parry", 180);
        set_skill("cuff", 180);
        set_skill("nianhua-zhi", 180);
        
        //新增wuji4及参合指对应少林指法 by 薪有所属
        set_skill("duoluoye-zhi", 180);
        set_skill("wuxiang-zhi", 180);
        set_skill("xiuluo-zhi", 180);
        set_skill("tianzhu-fuzhi", 180);
        
        set_skill("sanhua-zhang", 180);
        
        //新增神掌八打 by 薪有所属
        set_skill("shenzhang-bada", 180);
        
        
        set_skill("fengyun-shou", 180);
        set_skill("longzhua-gong", 180);
        set_skill("yintuoluo-zhua", 180);
        set_skill("buddhism", 200);
        set_skill("literate", 200);
        set_skill("medical", 200);
        set_skill("shaolin-yishu", 200);
        set_skill("unarmed",180);
        set_skill("shaolin-tantui",180);
        set_skill("qinna-shibada",180);
        set_skill("pona-gong",180);
        
        set_skill("qufannao-zhi",180);
        
        set_skill("woshi-zhang",180);
        set_skill("dacidabei-shou",180);
        
        set_skill("fuhu-quan",180);
        set_skill("zuiquan-sanda",180);
        set_skill("jimie-zhua",180);

        map_skill("force", "hunyuan-yiqi");
        map_skill("dodge", "shaolin-shenfa");
        map_skill("finger", "nianhua-zhi");
        map_skill("strike", "sanhua-zhang");
        map_skill("hand", "fengyun-shou");
        map_skill("claw", "longzhua-gong");
        map_skill("parry", "nianhua-zhi");

        prepare_skill("finger", "nianhua-zhi");
        prepare_skill("strike", "sanhua-zhang");

        create_family("少林派", 36, "弟子");
        

        set("inquiry", ([
                "pfm"       : (: ask_me :),
                "绝招"     : (: ask_me :)
        ]));
        setup();

        carry_object("/d/shaolin/obj/xuan-cloth")->wear();
}


string ask_me()
{
        mapping my_fam; 
        object fighter, me;
        //string *sname;
        //int i,j;

        fighter = this_player();
        me = this_object();
        my_fam  = me->query("family");

        if (my_fam && my_fam["family_name"] != "少林派")
                return RANK_D->query_respect(fighter) +
                       "又不是我们少林寺的人，打听少林绝技做什么？";
        return "你可以找我学习下列绝技: 一指点三脉,金刚伏魔诀,赤血连环爪。\n";

}

//新增pfm传授
int accept_ask(object me, string topic)  
{
        switch (topic)  
        {        
        
        case "历练" :
        case "历炼" :
        case "锻炼" :
                return QUEST_D->accept_ask(this_object(), me, topic);
                break;
        
                 
         case "一指点三脉" :  
                return MASTER_D->teach_pfm(me, this_object(),  
                        ([ "perform" : "can_perform/jingang-zhi/san",  
                           "name"    : "一指点三脉",  
                           "sk1"     : "jingang-zhi",  
                           "lv1"     : 200,  
                           "force"   : 300,  
                           "neili"   : 3000,  
                           "gongxian": 3000,  
                           "shen"    : 50000, ]));  
                break;  
         
         case "金刚伏魔诀" :  
                return MASTER_D->teach_pfm(me, this_object(),  
                        ([ "perform" : "can_perform/jingang-zhi/fumo",  
                           "name"    : "金刚伏魔诀",  
                           "sk1"     : "jingang-zhi",  
                           "lv1"     : 150,  
                           "force"   : 200,  
                           "neili"   : 2000,  
                           "gongxian": 1000,  
                           "shen"    : 30000, ]));  
                break;  
         
         case "赤血连环爪" :  
                return MASTER_D->teach_pfm(me, this_object(),  
                        ([ "perform" : "can_perform/yintuoluo-zhua/chixue",  
                           "name"    : "赤血连环爪",  
                           "sk1"     : "yintuoluo-zhua",  
                           "lv1"     : 200,  
                           "force"   : 300,  
                           "neili"   : 3000,  
                           "gongxian": 1500,  
                           "shen"    : 50000, ]));  
                break;  
                            
        default:  
                return 0;  
        }
}