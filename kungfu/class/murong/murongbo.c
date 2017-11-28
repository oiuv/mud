// murongbo.c 慕容博

#include <ansi.h>
#include "murong.h"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;
inherit F_COAGENT;

mixed try_learn_sk();
int try_learn_chz();

#define HUPO "/clone/lonely/hupohuan"

void create()
{
	set_name("慕容博", ({ "murong bo", "murong", "bo" }));
	set("long", @LONG
他是姑苏慕容的传人，可以说是自慕容龙城以下武功最为杰出
之人。不仅能贯通天下百家之长，更是深为精通慕容家绝技。
LONG );
	set("nickname", HIM "以彼之道 还施彼身" NOR);
	set("gender", "男性");
	set("age", 54);
	set("shen_type",-1);
	set("attitude", "peaceful");

	set("str", 31);
	set("int", 37);
	set("con", 34);
	set("dex", 33);

	set("qi", 5700);
	set("max_qi", 5700);
	set("jing", 2800);
	set("max_jing", 2800);
	set("neili", 7000);
	set("max_neili", 7000);
	set("jiali", 145);

	set("combat_exp", 2650000);

	// base skill
	set_skill("force", 280);
	set_skill("literate", 220);
	set_skill("jingluo-xue", 220);
	set_skill("unarmed", 260);
	set_skill("cuff", 280);
    set_skill("finger", 280);
	set_skill("strike", 260);
	set_skill("hand", 260);
	set_skill("claw", 260);
	set_skill("club", 260);
	set_skill("sword", 280);
	set_skill("blade", 260);
	set_skill("staff", 260);
	set_skill("dodge", 260);
	set_skill("parry", 300);

	// shaolin skill. No teach
	set_skill("banruo-zhang", 240);
	set_skill("cibei-dao", 240);
	set_skill("damo-jian", 240);
	set_skill("fengyun-shou", 240);
	set_skill("fumo-jian", 240);
	set_skill("hunyuan-yiqi", 240);
	set_skill("shaolin-xinfa", 240);
	set_skill("jingang-quan", 240);
	set_skill("longzhua-gong", 240);
	set_skill("luohan-quan", 240);
	set_skill("nianhua-zhi", 240);
	set_skill("pudu-zhang", 240);
	set_skill("qianye-shou", 240);
	set_skill("sanhua-zhang", 240);
	set_skill("riyue-bian", 240);
	set_skill("shaolin-shenfa", 240);
	set_skill("weituo-gun", 240);
	set_skill("wuchang-zhang", 240);
	set_skill("xiuluo-dao", 240);
	set_skill("yingzhua-gong", 240);
	set_skill("yizhi-chan", 240);
	set_skill("zui-gun", 240);

        // other skill
    set_skill("wudang-jian", 240);
	set_skill("xunlei-jian", 240);
	set_skill("quanzhen-jian", 260);
	set_skill("jidian-jian", 260);
	set_skill("hanmei-jian", 260);
	set_skill("baxian-jian", 260);
	set_skill("emei-jian", 260);
	set_skill("kunlun-jian", 260);
	set_skill("songfeng-jian", 260);
	set_skill("huashan-jian", 260);
	set_skill("yunhe-jian", 260);


	// murong skill
	set_skill("zihui-xinfa", 280);
	set_skill("murong-xinfa", 280);
	set_skill("douzhuan-xingyi", 300);
	set_skill("beidou-xianzong", 280);
	set_skill("canhe-zhi", 280);
	set_skill("qixing-quan", 280);
	set_skill("murong-jian", 280);
    set_skill("longcheng-shendao", 260);
    set_skill("martial-cognize", 220);

	map_skill("force", "zihui-xinfa");
	map_skill("dodge", "beidou-xianzong");
	map_skill("cuff",  "qixing-quan");
	map_skill("parry", "douzhuan-xingyi");
    map_skill("finger", "canhe-zhi");
	map_skill("sword", "murong-jian");
	map_skill("blade", "longcheng-shendao");

    prepare_skill("finger", "canhe-zhi");
    //prepare_skill("cuff", "qixing-quan");

	set("no_teach", ([
		"banruo-zhang"  : (: try_learn_sk :),
		"cibei-dao"     : (: try_learn_sk :),
		"damo-jian"     : (: try_learn_sk :),
		"fengyun-shou"  : (: try_learn_sk :),
		"fumo-jian"     : (: try_learn_sk :),
		"hunyuan-yiqi"  : (: try_learn_sk :),
		"shaolin-xinfa" : (: try_learn_sk :),
		"jingang-quan"  : (: try_learn_sk :),
		"longzhua-gong" : (: try_learn_sk :),
		"luohan-quan"   : (: try_learn_sk :),
		"nianhua-zhi"   : (: try_learn_sk :),
		"pudu-zhang"    : (: try_learn_sk :),
		"qianye-shou"   : (: try_learn_sk :),
		"sanhua-zhang"  : (: try_learn_sk :),
		"riyue-bian"    : (: try_learn_sk :),
		"shaolin-shenfa": (: try_learn_sk :),
		"weituo-gun"    : (: try_learn_sk :),
		"wuchang-zhang" : (: try_learn_sk :),
		"xiuluo-dao"    : (: try_learn_sk :),
		"yingzhua-gong" : (: try_learn_sk :),
		"yizhi-chan"    : (: try_learn_sk :),
		"zui-gun"       : (: try_learn_sk :),
                "canhe-zhi"     : (: try_learn_chz :),
	]));

	create_family("慕容世家", 15, "庄主");
	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: exert_function, "powerup" :),
		(: exert_function, "recover" :),
		(: perform_action, "finger.canhe" :),
		(: perform_action, "parry.yi" :),                
		(: perform_action, "finger.lian" :),
		(: perform_action, "finger.zhi" :),
	}));

        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 120);
        set_temp("apply/armor", 200);

	setup();
	carry_object("/clone/misc/cloth")->wear();
	add_money("silver", 100);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") > -36000)
        {
                command("say 我慕容博向来不与你们这些所谓正道人士交往。");
                command("say 你还是请回吧！");
                return;
        }
        if ((int)ob->query("combat_exp") < 500000)
        {
                command("say 你现在经验尚浅，还是多在江湖上走走吧。");
                return;
        }
        if ((int)ob->query_skill("douzhuan-xingyi", 1) < 130)
        {       
                command("say 斗转星移乃我慕容世家绝技，你不好好练习到我这来做甚？。");
                return;
        }
        if ((int)ob->query_skill("murong-xinfa", 1) < 120)
        {       
                command("say 我慕容世家武功讲究心神合一，最重视基本心法。");
                command("say 你的慕容心法还不够熟练，下去练练再来吧。");
                return;
        }
        if ((int)ob->query_skill("dodge") < 200)
        {
                command("say 我慕容世家武功需配合灵巧的身法。");
                command("say 你是否还应该在轻功修为上多下点功夫？");
                return;
        } 
       
        command("haha");
        command("pat " + ob->query("id"));
        command("recruit " + ob->query("id"));
        message_vision("慕容博大喜：我们慕容家真是英才迭出，复国有望啊！\n",
                       this_object());
}

mixed try_learn_sk()
{
	object me;

	me = this_player();
	if (me->query_temp("has_asked/murongbo"))
		return "你还是安心学本门功夫吧。";

	command("shake");
	command("say 据说少林的武功学了对身体有害，你就不要学了。");
	me->set_temp("has_asked/murongbo", 1);
	return -1;
}
// 演练后到120级，自修20级后方可学习。
int try_learn_chz()
{
       object me = this_player();

       if (me->query("shen") > 0)
       {
                command("heng");
                command("我最讨厌你们这些所谓正派人士，你还是请回吧！");
                return -1;
       }
       if (me->query("born_family") != "慕容世家")
       {
                command("sneer");
                command("say 你不是我们慕容家的人，我怎敢妄加指点。");
                command("say 阁下还是请回吧！");
                return -1;
       }
       if (me->query("family/master_id") != this_object()->query("id"))
       {
            command("shake");
	        command("say 阁下与我毫无瓜葛，我怎敢妄加指点？");
        	return -1;
       }
       if (me->query_skill("canhe-zhi", 1) < 150)
       {
	        command("shake");
	        command("say 你参合指火候还不够，还得下去多多练习。");
	        return -1;
       }                         

       return 0;
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

        case "斗转星移" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/douzhuan-xingyi/yi",
                           "name"    : "斗转星移",
                           "sk1"     : "douzhuan-xingyi",
                           "lv1"     : 160,
                           "sk2"     : "zihui-xinfa",
                           "lv2"     : 180,
                           "force"   : 160,
                           "gongxian": 900,
                           "shen"    : -60000, ]));
                break;

        case "七星指穴" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/canhe-zhi/zhi",
                           "name"    : "七星指穴",
                           "sk1"     : "canhe-zhi",
                           "lv1"     : 140,
                           "dodge"   : 140,
                           "force"   : 140,
                           "gongxian": 600,
                           "shen"    : -75000, ]));
                break;

        case "幽冥剑气" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/canhe-zhi/you",
                           "name"    : "幽冥剑气",
                           "sk1"     : "canhe-zhi",
                           "lv1"     : 140,
                           "force"   : 150,
                           "gongxian": 800,
                           "shen"    : -80000, ]));
                break;

        case "金刚剑气" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/canhe-zhi/jin",
                           "name"    : "金刚剑气",
                           "sk1"     : "canhe-zhi",
                           "lv1"     : 160,
                           "force"   : 160,
                           "gongxian": 1000,
                           "shen"    : -95000, ]));
                break;

        case "参合剑气" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/canhe-zhi/canhe",
                           "name"    : "参合剑气",
                           "sk1"     : "canhe-zhi",
                           "lv1"     : 160,
                           "force"   : 180,
                           "gongxian": 1200,
                           "shen"    : -130000, ]));
                break;

        case "琥珀神环" :
                return MASTER_D->give_item(me, this_object(),
                        ([ "item"    : HUPO,
                           "master"  : 1,
                           "sk1"     : "zihui-xinfa",
                           "lv1"     : 180,
                           "shen"    : -50000, ]));
                break;

        default:
                return 0;
        }
}

void unconcious()
{
        die();
}

